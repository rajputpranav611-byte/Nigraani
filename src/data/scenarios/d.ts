export const scenarioD = {
  id: "D",
  project: {
    id: "DR-14-09",
    name: "Rural Road Resurfacing",
    location: "Nandgaon Ward 14",
    contractor: "Shakti Infraworks Pvt. Ltd.",
    value: "₹1.8 Cr",
    dueDate: "2026-11-30"
  },
  claimedProgress: 100,
  milestones: [
    { id: "m1", name: "Excavation", weight: 25, completion: 100, status: "verified" },
    { id: "m2", name: "Concrete channel", weight: 30, completion: 100, status: "verified" },
    { id: "m3", name: "Culvert C-3", weight: 15, completion: 100, status: "verified" },
    { id: "m4", name: "Safety barriers", weight: 10, completion: 100, status: "verified" },
    { id: "m5", name: "Asphalt complete", weight: 20, completion: 20, status: "incomplete" }
  ],
  plannedQuantities: {
    drainageLength: 900
  },
  priorInspection: "September 12, excavation and foundation work verified.",
  scriptedObservations: [
    { type: "observation_recorded", payload: { statement: "Contractor claimed asphalt complete, but observed as gravel", category: "quality" } },
    { type: "truth_gap_calculated", payload: {} },
    { type: "action_staged", payload: {} }
  ],
  expectedOutcome: "Contractor clarification staged -> Stage contractor clarification and suggest payment certificate review."
};
