import { create } from 'zustand';
import { SCENARIOS } from '@/data/scenarios';
import { calculateTruthGap } from './truth-gap/engine';
import { ReportRepo } from './report-repo';

export type EventType = 
  | 'system_boot'
  | 'session_started'
  | 'observation_recorded'
  | 'evidence_attached'
  | 'truth_gap_calculated'
  | 'action_staged'
  | 'readback_confirmed'
  | 'report_submitted'
  | 'session_reset';

export interface AppEvent {
  id: string;
  ts: number;
  type: EventType;
  payload: any;
}

interface AppState {
  activeScenarioId: string;
  events: AppEvent[];
  inspectorConfirmation: boolean;
  dispatch: (type: EventType, payload?: any) => void;
  loadScenario: (id: string) => void;
  setInspectorConfirmation: (val: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  activeScenarioId: 'A',
  events: [],
  inspectorConfirmation: false,
  
  dispatch: (type, payload = {}) => {
    set(state => {
      const newEvent = {
        id: Math.random().toString(36).substring(7),
        ts: Date.now(),
        type,
        payload
      };
      
      const newEvents = [...state.events, newEvent];
      
      if (type === 'report_submitted') {
        ReportRepo.save({
          id: state.activeScenarioId,
          scenarioId: state.activeScenarioId,
          events: newEvents,
          submittedAt: Date.now()
        });
      }
      
      return { events: newEvents };
    });
  },
  
  loadScenario: (id) => {
    if (!SCENARIOS[id]) id = 'A';
    set({ activeScenarioId: id, events: [], inspectorConfirmation: false });
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('s', id);
      window.history.replaceState({}, '', url.toString());
    }
  },

  setInspectorConfirmation: (val) => set({ inspectorConfirmation: val })
}));

export const selectActiveScenario = (state: AppState) => SCENARIOS[state.activeScenarioId];

export const selectTruthGap = (state: AppState) => {
  const scenario = selectActiveScenario(state);
  return calculateTruthGap(scenario, state.events);
};

export const selectTimelineState = (state: AppState) => {
  const { events } = state;
  const types = events.map(e => e.type);
  
  if (types.includes('report_submitted') || types.includes('action_staged')) return 5;
  if (types.includes('readback_confirmed')) return 4;
  if (types.includes('truth_gap_calculated')) return 3;
  if (types.includes('evidence_attached')) return 2;
  if (types.includes('observation_recorded')) return 1;
  if (types.includes('session_started')) return 0;
  return -1;
};

const formatTime = (ts: number) => {
  const d = new Date(ts);
  return d.toISOString().substring(11, 19);
};

export const selectAuditLogs = (state: AppState) => {
  const logs = [];
  
  for (const event of state.events) {
    const time = formatTime(event.ts);
    if (event.type === 'system_boot') logs.push({ id: event.id, text: `[${time}] System boot` });
    if (event.type === 'session_started') logs.push({ id: event.id, text: `[${time}] Voice connection established` });
    if (event.type === 'observation_recorded') logs.push({ id: event.id, text: `[${time}] Observed: ${event.payload?.statement}` });
    if (event.type === 'evidence_attached') logs.push({ id: event.id, text: `[${time}] Evidence photo captured` });
    if (event.type === 'truth_gap_calculated') logs.push({ id: event.id, text: `[${time}] Gap calculation complete` });
    if (event.type === 'action_staged') logs.push({ id: event.id, text: `[${time}] Escalation staged` });
    if (event.type === 'readback_confirmed') logs.push({ id: event.id, text: `[${time}] Readback confirmed by inspector` });
    if (event.type === 'report_submitted') logs.push({ id: event.id, text: `[${time}] Final report transmitted` });
  }
  
  return logs;
};
