export const scenarioC = {
  id: "C",
  project: {
    id: "DR-14-09",
    name: "School Drinking Water Pipeline",
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
    { id: "m5", name: "Final 120m segment", weight: 20, completion: 90, status: "incomplete" }
  ],
  plannedQuantities: {
    drainageLength: 900
  },
  priorInspection: "September 12, excavation and foundation work verified.",
  scriptedObservations: [
    { type: "observation_recorded", payload: { statement: "Pipeline work is complete and pressure test is documented", category: "progress" } },
    { type: "truth_gap_calculated", payload: {} },
    { type: "action_staged", payload: {} }
  ],
  expectedOutcome: "Truth Gap 2% (Low Risk) -> Proceed with routine inspection report after confirmation."
};
