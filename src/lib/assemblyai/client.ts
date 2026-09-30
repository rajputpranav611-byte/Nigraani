const RATE = 24_000;
import { getProjectHistory } from '@/lib/mock-data/history';
import { useAppStore } from '@/lib/store';
import { SCENARIOS } from '@/data/scenarios';
import { BASE_AGENT_PROMPT } from '@/config/agent-prompt';

const TOOLS: Record<string, (args: any) => any> = {
  getProjectHistory,
  getProjectContext: () => ({ success: true, project: SCENARIOS[useAppStore.getState().activeScenarioId].project }),
  recordObservation: (args) => {
    useAppStore.getState().dispatch("observation_recorded", { statement: args.statement, category: args.category });
    return { success: true };
  },
  compareAgainstBaseline: () => ({ success: true, result: "Compared" }),
  requestEvidence: (args) => ({ success: true, requested: args.type }),
  attachDemoEvidence: () => {
    useAppStore.getState().dispatch("evidence_attached");
    return { success: true };
  },
  calculateTruthGap: () => {
    useAppStore.getState().dispatch("truth_gap_calculated");
    return { success: true };
  },
  stageEscalation: () => {
    useAppStore.getState().dispatch("action_staged");
    return { success: true };
  },
  generateReadback: () => {
    useAppStore.getState().dispatch("readback_confirmed");
    return { success: true };
  },
  submitInspectionReport: () => {
    const state = useAppStore.getState();
    const hasReadback = state.events.some(e => e.type === "readback_confirmed");
    if (!hasReadback || !state.inspectorConfirmation) {
      return { success: false, error: "Cannot submit until readback is confirmed and inspector UI box is checked." };
    }
    state.dispatch("report_submitted");
    return { success: true };
  },
  resetDemo: () => {
    useAppStore.getState().dispatch("session_reset");
    return { success: true };
  }
};

let sharedAudioContext: AudioContext | null = null;

export class VoiceAgentClient {
  private getWorkletUrl() {
    if (typeof window === 'undefined') return '';
    return URL.createObjectURL(new Blob([`
      class P extends AudioWorkletProcessor {
        constructor() {
          super();
          this.buffer = new Int16Array(4800); // ~100ms at 48kHz, or 200ms at 24kHz
          this.offset = 0;
        }
        process(inputs) {
          const ch = inputs[0]?.[0];
          if (ch) {
            for (let i = 0; i < ch.length; i++) {
              this.buffer[this.offset++] = Math.max(-32768, Math.min(32767, ch[i] * 32767));
              if (this.offset >= this.buffer.length) {
                const copy = new Int16Array(this.buffer);
                this.port.postMessage(copy.buffer, [copy.buffer]);
                this.offset = 0;
              }
            }
          }
          return true;
        }
      }
      registerProcessor("pcm", P);
    `], { type: 'application/javascript' }));
  }

  private ws: WebSocket | null = null;
  private mediaStream: MediaStream | null = null;
  private playT = 0;
  private ready = false;
  private reconnectAttempts = 0;
  private maxReconnects = 3;
  private isConnecting = false;
  
  public onTranscript?: (text: string, isAgent: boolean, isFinal: boolean) => void;
  public onStateChange?: (state: "Ready" | "Connecting..." | "Listening" | "Processing" | "Speaking" | "Error" | "Disconnected") => void;
  
  public systemPrompt: string = "";
  public greeting: string = "Hi! How can I help?";
  public mockMode: boolean = false;

  constructor(public projectId: string = "DR-14-09") {
    // Normalize ID
    const normalizedId = projectId.replace(/[\s-]/g, '').toUpperCase().replace(/DR/, 'DR-').replace(/(\d{2})(\d{2})/, '$1-$2');
    this.projectId = normalizedId;
    
    const scenario = SCENARIOS[useAppStore.getState().activeScenarioId] || SCENARIOS['A'];

    this.systemPrompt = `${BASE_AGENT_PROMPT}

DEFAULT PROJECT
${scenario.project.id}, ${scenario.project.name}, ${scenario.project.location}.
Contractor: ${scenario.project.contractor}. Approved value: ${scenario.project.value}.
Last inspection: ${scenario.priorInspection}
For older history, call getProjectHistory.`;
  }

  async connect(prefetchedData?: any) {
    if (this.isConnecting || this.ready) return;
    this.isConnecting = true;
    this.onStateChange?.("Connecting...");
    
    try {
      const data = prefetchedData || await (await fetch("/api/session", { method: "POST" })).json();
      
      if (data.mockMode) {
        this.mockMode = true;
        setTimeout(() => {
          this.onStateChange?.("Ready");
        }, 1000);
        this.isConnecting = false;
        return;
      }

      if (data.error === "not_configured" || !data.token) {
        this.onStateChange?.("Error");
        this.isConnecting = false;
        return;
      }

      this.mockMode = false;
      const token = data.token;
      
      if (!sharedAudioContext) {
        sharedAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: RATE });
      }
      if (sharedAudioContext.state === 'suspended') {
        await sharedAudioContext.resume();
      }
      
      const workletUrl = this.getWorkletUrl();
      try {
        await sharedAudioContext.audioWorklet.addModule(workletUrl);
      } catch (e) {
        // already added
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });
      const source = sharedAudioContext.createMediaStreamSource(this.mediaStream);
      const worklet = new AudioWorkletNode(sharedAudioContext, 'pcm');

      const url = new URL('wss://agents.assemblyai.com/v1/ws');
      url.searchParams.set('token', token);
      this.ws = new WebSocket(url);

      this.playT = 0;
      this.ready = false;

      worklet.port.onmessage = ({ data }) => {
        if (!this.ready || this.ws?.readyState !== 1) return;
        const b = new Uint8Array(data);
        const chunk = 8192;
        let s = '';
        for (let i = 0; i < b.length; i += chunk) {
          s += String.fromCharCode.apply(null, Array.from(b.subarray(i, i + chunk)));
        }
        this.ws.send(JSON.stringify({ type: 'input.audio', audio: btoa(s) }));
      };
      
      source.connect(worklet).connect(sharedAudioContext.destination);

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.isConnecting = false;
        this.ws?.send(JSON.stringify({
          type: 'session.update',
          session: {
            system_prompt: this.systemPrompt,
            greeting: this.greeting,
            output: { voice: 'michael' },
            tools: [
              {
                type: 'function',
                name: 'getProjectHistory',
                description: 'Fetch the prior inspection records and history for a given project.',
                parameters: { type: 'object', properties: { projectId: { type: 'string' } }, required: ['projectId'] }
              },
              {
                type: 'function',
                name: 'getProjectContext',
                description: 'Get details about the active project.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'recordObservation',
                description: 'Record a field observation.',
                parameters: { type: 'object', properties: { statement: { type: 'string' }, category: { type: 'string' } }, required: ['statement', 'category'] }
              },
              {
                type: 'function',
                name: 'compareAgainstBaseline',
                description: 'Compare observation against baseline.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'requestEvidence',
                description: 'Request photo or document evidence.',
                parameters: { type: 'object', properties: { type: { type: 'string' } }, required: ['type'] }
              },
              {
                type: 'function',
                name: 'attachDemoEvidence',
                description: 'Simulate attaching evidence.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'calculateTruthGap',
                description: 'Trigger the truth gap engine calculation.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'stageEscalation',
                description: 'Stage an escalation or review.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'generateReadback',
                description: 'Confirm findings with the user.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'submitInspectionReport',
                description: 'Submit the final inspection report.',
                parameters: { type: 'object', properties: {} }
              },
              {
                type: 'function',
                name: 'resetDemo',
                description: 'Reset the demo session.',
                parameters: { type: 'object', properties: {} }
              }
            ]
          }
        }));
      };

      this.ws.onmessage = ({ data }) => {
        const m = JSON.parse(data);
        switch (m.type) {
          case 'session.ready':
            this.ready = true;
            this.onStateChange?.("Ready");
            break;
            
          case 'input.speech.started':
            this.onStateChange?.("Listening");
            break;

          case 'reply.audio': {
            if (!sharedAudioContext) break;
            const raw = atob(m.data);
            const pcm = new Int16Array(raw.length / 2);
            for (let i = 0; i < pcm.length; i++)
              pcm[i] = raw.charCodeAt(i * 2) | (raw.charCodeAt(i * 2 + 1) << 8);
            const f32 = new Float32Array(pcm.length);
            for (let i = 0; i < pcm.length; i++) f32[i] = pcm[i] / 32768;
            const buf = sharedAudioContext.createBuffer(1, f32.length, RATE);
            buf.getChannelData(0).set(f32);
            const src = sharedAudioContext.createBufferSource();
            src.buffer = buf; 
            src.connect(sharedAudioContext.destination);
            this.playT = Math.max(this.playT, sharedAudioContext.currentTime);
            src.start(this.playT); 
            this.playT += buf.duration;
            break;
          }

          case 'reply.done':
            if (m.status === 'interrupted' && sharedAudioContext) {
              this.playT = sharedAudioContext.currentTime;
            }
            break;

          case 'transcript.user':  
            this.onTranscript?.(m.text, false, m.is_final ?? m.final ?? false);
            this.onStateChange?.("Processing");
            break;
            
          case 'transcript.agent': 
            this.onTranscript?.(m.text, true, m.is_final ?? m.final ?? false);
            this.onStateChange?.("Speaking");
            break;
            
          case 'session.error':
            console.error('Agent error:', m.message);
            this.onStateChange?.("Error");
            break;

          case 'tool_call': {
            const handler = TOOLS[m.name];
            if (handler) {
              try {
                const args = JSON.parse(m.arguments);
                const result = handler(args);
                this.ws?.send(JSON.stringify({
                  type: 'tool_result',
                  tool_call_id: m.tool_call_id,
                  result: JSON.stringify(result)
                }));
              } catch (e: any) {
                this.ws?.send(JSON.stringify({
                  type: 'tool_result',
                  tool_call_id: m.tool_call_id,
                  result: JSON.stringify({ success: false, error: e?.message || "Failed" })
                }));
              }
            } else {
              this.ws?.send(JSON.stringify({
                type: 'tool_result',
                tool_call_id: m.tool_call_id,
                result: JSON.stringify({ success: false, error: "unknown tool" })
              }));
            }
            break;
          }
        }
      };

      this.ws.onerror = () => this.handleDisconnect();
      this.ws.onclose = () => this.handleDisconnect();

    } catch (err) {
      console.error(err);
      this.isConnecting = false;
      this.handleDisconnect();
    }
  }

  private handleDisconnect() {
    this.ready = false;
    this.isConnecting = false;
    if (this.reconnectAttempts < this.maxReconnects && !this.mockMode) {
      const backoff = [1000, 2000, 4000][this.reconnectAttempts];
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), backoff);
    } else {
      this.onStateChange?.("Error");
    }
  }

  disconnect() {
    this.reconnectAttempts = this.maxReconnects; // prevent reconnect
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    this.ready = false;
    this.isConnecting = false;
    this.onStateChange?.("Disconnected");
  }
}
