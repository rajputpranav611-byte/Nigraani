import { z } from "zod";

export const MilestoneSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.enum(["verified", "partial", "incomplete", "missing", "unbuilt"]),
  plannedValue: z.string().optional(),
  reportedValue: z.string().optional(),
});
export type Milestone = z.infer<typeof MilestoneSchema>;

export const ProjectSchema = z.object({
  id: z.string(),
  name: z.string(),
  location: z.string(),
  contractor: z.string(),
  approvedValue: z.string(),
  plannedProgress: z.number(),
  reportedProgress: z.number(),
  dueDate: z.string(),
  milestones: z.array(MilestoneSchema),
  previousInspectionSummary: z.string(),
});
export type Project = z.infer<typeof ProjectSchema>;
