"use client";

import { useEffect, useState } from "react";
import { ReportRepo, ReportData } from "@/lib/report-repo";
import { SCENARIOS } from "@/data/scenarios";
import { calculateTruthGap } from "@/lib/truth-gap/engine";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function ReportPage({ params }: { params: { inspectionId: string } }) {
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    const data = ReportRepo.get(params.inspectionId);
    if (data) {
      setTimeout(() => setReport(data), 0);
    }
  }, [params.inspectionId]);

  if (!report) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg text-text font-body">
        <p>Loading report or report not found...</p>
      </div>
    );
  }

  const scenario = SCENARIOS[report.scenarioId];
  const truthGap = calculateTruthGap(scenario, report.events);
  const observations = report.events.filter(e => e.type === "observation_recorded");

  return (
    <div className="min-h-screen bg-bg text-text font-body p-8 print:p-0 print:bg-white print:text-black">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="flex justify-between items-start print:hidden mb-8">
          <Link href={`/inspection?s=${report.scenarioId}`} className="text-text-muted hover:text-text text-sm font-mono uppercase tracking-widest border border-border px-4 py-2 rounded-lg">
            &larr; Back to Inspection
          </Link>
          <button onClick={() => window.print()} className="bg-accent text-bg px-4 py-2 rounded-lg text-sm font-mono uppercase tracking-widest font-bold">
            Print Report
          </button>
        </div>

        <header className="border-b border-border pb-6">
          <h1 className="text-3xl font-display font-medium mb-2">Field Inspection Report</h1>
          <div className="flex gap-4 text-sm font-mono uppercase text-text-muted tracking-widest">
            <span>Project: {scenario.project.id}</span>
            <span>Date: {new Date(report.submittedAt).toLocaleDateString()}</span>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-8">
          <div>
            <h2 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-4 text-text-muted border-b border-border pb-2">Project Details</h2>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-text-muted">Name</dt><dd className="font-medium">{scenario.project.name}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Location</dt><dd className="font-medium">{scenario.project.location}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Contractor</dt><dd className="font-medium">{scenario.project.contractor}</dd></div>
              <div className="flex justify-between"><dt className="text-text-muted">Value</dt><dd className="font-medium">{scenario.project.value}</dd></div>
            </dl>
          </div>
          <div>
            <h2 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-4 text-text-muted border-b border-border pb-2">Analysis Result</h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-display tabular-nums font-semibold">{truthGap.score}%</div>
              <div>
                <div className="text-[11px] font-mono uppercase tracking-[0.14em] text-text-muted mb-1">Gap Detected</div>
                <Badge variant="outline" className={`font-mono text-[11px] uppercase tracking-[0.14em] px-2 py-0.5 border-current bg-transparent ${truthGap.score > 0 ? 'text-warn' : 'text-ok'}`}>
                  {truthGap.score > 0 ? <AlertTriangle size={12} className="mr-1" /> : <ShieldCheck size={12} className="mr-1" />}
                  {truthGap.status}
                </Badge>
              </div>
            </div>
            {truthGap.severity !== "NONE" && (
              <div className="text-sm">
                Severity: <span className="font-bold text-danger">{truthGap.severity}</span>
              </div>
            )}
            <div className="mt-4 p-3 rounded-lg border border-border bg-bg-raised text-sm">
              <span className="font-bold">Recommended Action:</span> {truthGap.recommendedAction}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-4 text-text-muted border-b border-border pb-2">Recorded Observations</h2>
          {observations.length === 0 ? (
            <p className="text-sm text-text-muted italic">No anomalies observed.</p>
          ) : (
            <ul className="space-y-3">
              {observations.map(obs => (
                <li key={obs.id} className="p-4 rounded-lg border border-border bg-bg-card flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
                  <div>
                    <p className="text-sm">{obs.payload.statement}</p>
                    <p className="text-[10px] font-mono uppercase tracking-[0.14em] text-text-muted mt-2">
                      Category: {obs.payload.category || "General"} &bull; Time: {new Date(obs.ts).toLocaleTimeString()}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <footer className="pt-16 border-t border-border mt-16 text-center">
          <p className="text-xl font-mono uppercase tracking-[0.2em] font-bold text-accent mb-2">
            REPORT SUBMITTED FOR REVIEW
          </p>
          <p className="text-xs text-text-muted font-mono uppercase tracking-widest">
            Generated by NIGRAANI.SYS // ID: {report.id}
          </p>
        </footer>

      </div>
    </div>
  );
}
