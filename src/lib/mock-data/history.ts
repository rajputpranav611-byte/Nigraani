export const normalizeProjectId = (raw: string) => {
  const d = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const m = d.match(/^([A-Z]{2})(\d{2})(\d{2})$/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : raw;
};

export const HISTORY: Record<string, { date: string; type: string; summary: string }[]> = {
  "DR-14-09": [
    { date: "2026-09-12", type: "Inspection", summary: "Excavation and foundation work verified." },
    { date: "2026-08-28", type: "Contractor report", summary: "Concrete channel reported 40% complete." },
    { date: "2026-08-05", type: "Site mobilization", summary: "Work order issued to Shakti Infraworks Pvt. Ltd." },
  ],
};

import { z } from "zod";

const schema = z.object({ projectId: z.string() });
export function getProjectHistory(input: unknown) {
  const { projectId } = schema.parse(input);
  const id = normalizeProjectId(projectId);
  const entries = HISTORY[id];
  return entries
    ? { success: true, projectId: id, contractor: "Shakti Infraworks Pvt. Ltd.", entries }
    : { success: false, error: `No record found for ${id}` };
}
