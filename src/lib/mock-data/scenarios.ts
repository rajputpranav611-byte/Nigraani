import { Project } from "@/types/project";
import { Observation as ObsType, TruthGap as TgType } from "@/types/inspection";

export const mockProjects: Record<string, Project> = {
  "DR-14-09": {
    id: "DR-14-09",
    name: "Ward 14 Drainage Rehabilitation",
    location: "Nandgaon Ward 14",
    contractor: "Shakti Infraworks Pvt. Ltd.",
    approvedValue: "₹1.8 Cr",
    plannedProgress: 65,
    reportedProgress: 65,
    dueDate: "2026-10-15",
    previousInspectionSummary: "Excavation and foundation work verified on Sep 12.",
    milestones: [
      { id: "m1", title: "Drainage excavation", status: "verified", plannedValue: "Complete", reportedValue: "Complete" },
      { id: "m2", title: "Concrete channel", status: "partial", plannedValue: "Complete", reportedValue: "Complete" },
      { id: "m3", title: "Culvert C-3", status: "incomplete", plannedValue: "Complete", reportedValue: "Complete" },
      { id: "m4", title: "Safety barriers", status: "missing", plannedValue: "Present", reportedValue: "Present" },
      { id: "m5", title: "Final 120m segment", status: "unbuilt", plannedValue: "Complete", reportedValue: "Complete" },
    ]
  },
  "CH-21-04": {
    id: "CH-21-04",
    name: "Community Health Centre Renovation",
    location: "Sector 4",
    contractor: "BuildWell Associates",
    approvedValue: "₹3.2 Cr",
    plannedProgress: 40,
    reportedProgress: 40,
    dueDate: "2027-02-28",
    previousInspectionSummary: "Initial demolition phase completed safely.",
    milestones: [
      { id: "m1", title: "Demolition", status: "verified" },
      { id: "m2", title: "West stairwell reinforcement", status: "incomplete" }
    ]
  }
};
