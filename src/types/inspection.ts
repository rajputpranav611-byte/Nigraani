import { z } from "zod";

export const ObservationSchema = z.object({
  id: z.string(),
  category: z.enum(["progress", "quality", "safety", "quantity", "timeline"]),
  statement: z.string(),
  timestamp: z.string(),
  confidence: z.number(),
});
export type Observation = z.infer<typeof ObservationSchema>;

export const TruthGapSchema = z.object({
  score: z.number(), // 0-100 gap percentage
  status: z.enum(["CLEAN", "REVIEW REQUIRED", "CRITICAL", "AWAITING OBSERVATIONS"]),
  severity: z.enum(["NONE", "LOW", "MODERATE", "HIGH", "CRITICAL"]).optional(),
  factors: z.array(z.string()),
  recommendedAction: z.string(),
});
export type TruthGap = z.infer<typeof TruthGapSchema>;
