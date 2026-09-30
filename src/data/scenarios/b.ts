export const scenarioB = {
  id: "B",
  project: {
    id: "DR-14-09",
    name: "Community Health Centre Renovation",
    location: "Nandgaon Ward 14",
    contractor: "Shakti Infraworks Pvt. Ltd.",
    value: "₹1.8 Cr",
    dueDate: "2026-11-30"
  },
  claimedProgress: 70,
  milestones: [
    { id: "m1", name: "Excavation", weight: 25, completion: 100, status: "verified" },
    { id: "m2", name: "Concrete channel", weight: 30, completion: 80, status: "incomplete" },
    { id: "m3", name: "Culvert C-3", weight: 15, completion: 60, status: "incomplete" },
    { id: "m4", name: "Safety barriers", weight: 10, completion: 0, status: "missing" },
    { id: "m5", name: "Stairwell rebar", weight: 20, completion: 0, status: "unbuilt" }
  ],
  plannedQuantities: {
    drainageLength: 900
  },
  priorInspection: "September 12, excavation and foundation work verified.",
  scriptedObservations: [
    { type: "observation_recorded", payload: { statement: "Exposed reinforcement bars near the stairwell", category: "quality" } },
    { type: "evidence_attached", payload: {} },
    { type: "truth_gap_calculated", payload: {} },
    { type: "action_staged", payload: {} }
  ],
  expectedOutcome: "Quality-control review staged -> Stage quality-control review and request photo evidence."
};
