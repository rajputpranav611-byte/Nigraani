import { AppEvent } from './store';
import { SCENARIOS } from '@/data/scenarios';

export interface ReportData {
  id: string;
  scenarioId: string;
  events: AppEvent[];
  submittedAt: number;
}

export const ReportRepo = {
  save: (report: ReportData) => {
    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem('nigraani_reports');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      existing[report.id] = report;
      localStorage.setItem('nigraani_reports', JSON.stringify(existing));
    }
  },
  get: (id: string): ReportData | null => {
    if (typeof window !== 'undefined') {
      const existingStr = localStorage.getItem('nigraani_reports');
      const existing = existingStr ? JSON.parse(existingStr) : {};
      return existing[id] || null;
    }
    return null;
  }
};
