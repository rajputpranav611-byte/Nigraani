"use client";
import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { Mic, MicOff, Activity } from "lucide-react";
import { VoiceAgentClient } from "@/lib/assemblyai/client";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";

import { useAppStore } from "@/lib/store";

export function LiveWalkPanel({ projectId, scenario }: { projectId: string, scenario?: any }) {
  const [isListening, setIsListening] = useState(false);
  const [status, setStatus] = useState<string>("Ready");
  const [transcripts, setTranscripts] = useState<{id: string, text: string, isAgent: boolean, isFinal: boolean}[]>([]);
  const [isMockMode, setIsMockMode] = useState(false);
  const [tokenData, setTokenData] = useState<any>(null);
  const agentRef = useRef<VoiceAgentClient | null>(null);

  const dispatch = useAppStore(state => state.dispatch);
  
  useEffect(() => {
    fetch("/api/session", { method: "POST" })
      .then(r => r.json())
      .then(data => setTokenData(data))
      .catch(e => console.error(e));
      
    return () => {
      if (agentRef.current) {
        agentRef.current.disconnect();
      }
    };
  }, []);

  const playScriptedWalk = async () => {
    if (!scenario?.scriptedObservations) return;
    setIsMockMode(true);
    setStatus("Playing Script...");
    
    for (let i = 0; i < scenario.scriptedObservations.length; i++) {
      const obs = scenario.scriptedObservations[i];
      await new Promise(r => setTimeout(r, 2500));
      
      if (obs.type === "observation_recorded" && obs.payload?.statement) {
        setTranscripts(prev => [...prev, { id: Date.now().toString(), text: obs.payload.statement, isAgent: false, isFinal: true }]);
      }
      dispatch(obs.type, obs.payload);
    }
    
    setStatus("Script Complete");
    setTimeout(() => {
      setIsMockMode(false);
      setIsListening(false);
      setStatus("Ready");
    }, 2000);
  };

  const toggleListening = async () => {
    if (tokenData?.mockMode) {
      if (isListening || isMockMode) {
        setIsListening(false);
        setIsMockMode(false);
        setStatus("Ready");
        return;
      }
      setIsListening(true);
      return playScriptedWalk();
    }

    if (isListening && agentRef.current) {
      agentRef.current.disconnect();
      agentRef.current = null;
      setIsListening(false);
      setStatus("Ready");
    } else {
      setIsListening(true);
      setStatus("Connecting...");
      const agent = new VoiceAgentClient(projectId);
      agentRef.current = agent;

      agent.onStateChange = (newState) => {
        setStatus(newState);
        if (newState === "Disconnected" || newState === "Error") {
          setIsListening(false);
        }
      };

      agent.onTranscript = (text, isAgent, isFinal) => {
        setTranscripts(prev => {
          const newArray = [...prev];
          const last = newArray[newArray.length - 1];
          if (last && last.isAgent === isAgent && !last.isFinal) {
            last.text = text;
            last.isFinal = isFinal;
          } else {
            newArray.push({ id: Math.random().toString(), text, isAgent, isFinal });
          }
          return newArray;
        });
      };

      await agent.connect(tokenData);
    }
  };

  const disableStart = status === "Connecting..." || status === "Listening" || status === "Processing" || status === "Speaking";

  return (
    <Card className="min-h-full rounded-none border-0 bg-bg text-text shadow-none flex flex-col font-body">
      <CardHeader className="border-b border-border pb-4 flex flex-row items-center justify-between">
        <CardTitle className="text-[11px] font-mono tracking-[0.14em] uppercase text-text-muted">
          Live Site Walk
        </CardTitle>
        <div className="flex items-center gap-4">
          {isMockMode && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-info text-info bg-info/10">
              SCRIPTED REPLAY
            </span>
          )}
          <div className="flex items-center gap-2">
            {isListening && <span className="flex w-2 h-2 rounded-full bg-danger animate-pulse" />}
            <span className="text-[11px] font-mono text-text-muted uppercase tracking-[0.14em]">
              {status}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden bg-bg">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(236,228,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(236,228,212,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        <div className="w-full h-full z-10 flex flex-col gap-4 p-4 mt-8">
          {transcripts.map((t) => (
            <div key={t.id} className={`w-full flex ${t.isAgent ? 'justify-start' : 'justify-end'} mb-4`}>
              <div className="flex flex-col gap-1 max-w-[80%]">
                {isMockMode && (
                  <span className={`text-[9px] font-mono uppercase text-text-muted ${t.isAgent ? 'text-left' : 'text-right'}`}>
                    SCRIPTED
                  </span>
                )}
                <div className={`p-4 rounded-xl border ${
                  t.isAgent ? 'bg-bg-raised border-border' : 'bg-bg-card border-border-strong'
                }`}>
                {t.isFinal ? (
                  <TextGenerateEffect words={t.text} className="text-sm" duration={0.5} />
                ) : (
                  <span className="text-sm">{t.text}</span>
                )}
                </div>
              </div>
            </div>
          ))}
          {transcripts.length === 0 && (
            <div className="h-full flex items-center justify-center text-text-muted text-sm relative z-20">
              Press start to begin the inspection walk.
            </div>
          )}
        </div>
      </div>

      <div className="p-6 border-t border-border bg-bg flex items-center justify-center">
        <MovingBorderButton 
          onClick={toggleListening}
          disabled={disableStart}
          borderRadius="9999px"
          containerClassName="overflow-hidden rounded-full"
          duration={isListening ? 1000000 : 3000}
          className={`flex items-center gap-3 px-8 py-4 font-mono uppercase tracking-[0.08em] text-[12px] bg-bg-card transition-colors ${
            isListening ? 'text-danger' : 'text-accent'
          }`}
          borderClassName={isListening ? "bg-danger opacity-0" : "bg-accent"}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          <span>
            {isListening ? 'End Voice Session' : 'Start Site Walk'}
          </span>
        </MovingBorderButton>
      </div>
    </Card>
  );
}
