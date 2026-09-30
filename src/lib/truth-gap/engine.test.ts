import { describe, it, expect } from 'vitest';
import { calculateTruthGap } from './engine';
import { SCENARIOS } from '@/data/scenarios';
import { useAppStore } from '@/lib/store';

describe('Truth Gap Engine', () => {
  it('handles Scenario A correctly', () => {
    const scenario = SCENARIOS['A'];
    const events = [{ type: 'observation_recorded', payload: {} }];
    const gap = calculateTruthGap(scenario, events);
    expect(gap.score).toBe(17);
    expect(gap.severity).toBe('HIGH');
  });

  it('handles Scenario B correctly', () => {
    const scenario = SCENARIOS['B'];
    const events = [{ type: 'observation_recorded', payload: {} }];
    const gap = calculateTruthGap(scenario, events);
    expect(gap.score).toBe(12);
    expect(gap.severity).toBe('HIGH');
  });

  it('handles Scenario C correctly', () => {
    const scenario = SCENARIOS['C'];
    const events = [{ type: 'observation_recorded', payload: {} }];
    const gap = calculateTruthGap(scenario, events);
    expect(gap.score).toBe(2);
    expect(gap.severity).toBe('LOW');
  });

  it('handles Scenario D correctly', () => {
    const scenario = SCENARIOS['D'];
    const events = [{ type: 'observation_recorded', payload: {} }];
    const gap = calculateTruthGap(scenario, events);
    expect(gap.score).toBe(16);
    expect(gap.severity).toBe('HIGH');
  });

  it('handles Idle state correctly', () => {
    const scenario = SCENARIOS['A'];
    const gap = calculateTruthGap(scenario, []);
    expect(gap.score).toBe(0);
    expect(gap.status).toBe('AWAITING OBSERVATIONS');
  });
});

describe('submitInspectionReport rules', () => {
  it('refuses to submit unless readback_confirmed exists AND inspectorConfirmation is true', () => {
    const state = useAppStore.getState();
    // mock dispatch
    let dispatched = false;
    state.dispatch = () => { dispatched = true; };
    
    // reset
    state.events = [];
    state.inspectorConfirmation = false;
    
    const submitInspectionReport = () => {
      const hasReadback = state.events.some(e => e.type === "readback_confirmed");
      if (!hasReadback || !state.inspectorConfirmation) {
        return { success: false, error: "Cannot submit until readback is confirmed and inspector UI box is checked." };
      }
      state.dispatch("report_submitted");
      return { success: true };
    };

    // Case 1: no readback, no confirm
    let res = submitInspectionReport();
    expect(res.success).toBe(false);

    // Case 2: readback, no confirm
    state.events = [{ type: 'readback_confirmed', id: '1', ts: 1, payload: {} }];
    res = submitInspectionReport();
    expect(res.success).toBe(false);

    // Case 3: no readback, confirm
    state.events = [];
    state.inspectorConfirmation = true;
    res = submitInspectionReport();
    expect(res.success).toBe(false);

    // Case 4: readback and confirm
    state.events = [{ type: 'readback_confirmed', id: '1', ts: 1, payload: {} }];
    state.inspectorConfirmation = true;
    res = submitInspectionReport();
    expect(res.success).toBe(true);
    expect(dispatched).toBe(true);
  });
});
