export function observedCompletion(milestones: any[]) {
  const totalWeight = milestones.reduce((sum, m) => sum + m.weight, 0);
  if (totalWeight === 0) return 0;
  const completion = milestones.reduce((sum, m) => sum + (m.weight * m.completion / 100), 0);
  return Math.round((completion / totalWeight) * 100);
}

export function severity(gap: number) {
  if (gap < 5) return "LOW";
  if (gap <= 10) return "MODERATE";
  if (gap <= 20) return "HIGH";
  return "CRITICAL";
}

export function calculateTruthGap(scenario: any, events: any[]) {
  const hasObservation = events.some(e => e.type === "observation_recorded");
  if (!hasObservation) {
    return {
      score: 0,
      status: "AWAITING OBSERVATIONS",
      severity: "NONE",
      factors: [],
      recommendedAction: "System idle. Awaiting voice input."
    };
  }

  const observed = observedCompletion(scenario.milestones);
  const gap = Math.max(0, scenario.claimedProgress - observed);
  const sev = severity(gap);
  
  const factors = events
    .filter(e => e.type === "observation_recorded")
    .map(e => e.payload.statement);

  let recommendedAction = "Review staged action";
  if (sev === "LOW") recommendedAction = "Routine report generated";
  else if (sev === "MODERATE") recommendedAction = "Supervisor review suggested";
  else if (sev === "HIGH") recommendedAction = "Supervisor review staged";
  else recommendedAction = "Payment certificate review suggested";

  if (scenario.expectedOutcome) {
    const outcomeParts = scenario.expectedOutcome.split("->");
    if (outcomeParts.length > 1) {
      recommendedAction = outcomeParts[1].trim();
    }
  }

  return {
    score: gap,
    status: gap > 0 ? "GAP DETECTED" : "VERIFIED",
    severity: gap > 0 ? sev : "NONE",
    factors,
    recommendedAction
  };
}
