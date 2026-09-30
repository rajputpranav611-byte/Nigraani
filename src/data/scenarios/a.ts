export const scenarioA = {
  id: "A",
  project: {
    id: "DR-14-09",
    name: "Ward 14 Drainage Rehabilitation",
    location: "Nandgaon Ward 14",
    contractor: "Shakti Infraworks Pvt. Ltd.",
    value: "₹1.8 Cr",
    dueDate: "2026-11-30"
  },
  claimedProgress: 65,
  milestones: [
    { id: "m1", name: "Excavation", weight: 25, completion: 100, status: "verified" },
    { id: "m2", name: "Concrete channel", weight: 30, completion: 60, status: "incomplete" },
    { id: "m3", name: "Culvert C-3", weight: 15, completion: 33, status: "incomplete" },
    { id: "m4", name: "Safety barriers", weight: 10, completion: 0, status: "missing" },
    { id: "m5", name: "Final 120m segment", weight: 20, completion: 0, status: "unbuilt" }
  ],
  plannedQuantities: {
    drainageLength: 900
  },
  priorInspection: "September 12, excavation and foundation work verified.",
  scriptedObservations: [
    { type: "observation_recorded", payload: { statement: "Final 120m segment unbuilt", category: "progress" } },
    { type: "observation_recorded", payload: { statement: "Safety barriers are missing", category: "safety" } },
    { type: "truth_gap_calculated", payload: {} },
    { type: "action_staged", payload: {} }
  ],
  expectedOutcome: "Truth Gap 17% (High Risk) -> Stage supervisor review before next payment certification."
};
