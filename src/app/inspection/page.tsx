"use client";

import { ProjectContextPanel } from "@/components/inspection/project-context-panel";
import { LiveWalkPanel } from "@/components/inspection/live-walk-panel";
import { TruthGapPanel } from "@/components/inspection/truth-gap-panel";
import { EvidenceTimeline } from "@/components/inspection/evidence-timeline";
import { useAppStore, selectActiveScenario, selectTruthGap, selectTimelineState, selectAuditLogs } from "@/lib/store";
import React, { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { Activity } from "lucide-react";
import { useSearchParams } from "next/navigation";
const LogLine = React.memo(({ log }: { log: { id: string, text: string } }) => (
  <div key={log.id}>{log.text}</div>
));
LogLine.displayName = "LogLine";

function InspectionContent() {
  const searchParams = useSearchParams();
  const loadScenario = useAppStore(state => state.loadScenario);
  
  const dispatch = useAppStore(state => state.dispatch);
  
  useEffect(() => {
    const s = searchParams.get("s");
    if (s) loadScenario(s);
    else loadScenario("A");
    
    // dispatch system_boot once on mount
    dispatch('system_boot');
  }, [searchParams, loadScenario, dispatch]);

  const activeScenarioId = useAppStore(state => state.activeScenarioId);
  const events = useAppStore(state => state.events);

  const scenario = useMemo(() => useAppStore.getState().activeScenarioId === activeScenarioId ? selectActiveScenario(useAppStore.getState()) : null, [activeScenarioId]);
  
  const truthGap = useMemo(() => {
    return scenario ? selectTruthGap({ activeScenarioId, events } as any) : null;
  }, [scenario, activeScenarioId, events]);
  
  const timelineState = useMemo(() => {
    return selectTimelineState({ events } as any);
  }, [events]);
  
  const auditLogs = useMemo(() => {
    return selectAuditLogs({ events } as any);
  }, [events]);
  
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(false);

  if (!scenario) return null;

  const project = scenario.project;

  return (
    <div className="flex flex-col h-dvh bg-bg text-text overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-bg-card px-4 flex items-center justify-between shrink-0 font-body">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-bg-raised transition-colors text-[11px] font-mono uppercase tracking-[0.14em] text-text-muted hover:text-text">
            &larr; Back
          </Link>
          <div className="h-4 w-px bg-border" />
          <Link href="/" className="font-mono text-accent font-bold tracking-[0.14em] text-[11px] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            NIGRAANI
          </Link>
          <div className="h-4 w-px bg-border" />
          <span className="text-sm font-medium text-text">{project.name}</span>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-3 py-1 bg-accent-soft border border-accent/30 rounded-full text-[11px] font-mono text-accent uppercase tracking-[0.14em]">
            <Activity size={12} />
            DEMO DATA — NOT AN OFFICIAL GOVERNMENT RECORD
          </div>
          <div className="text-[11px] font-mono text-text-muted uppercase tracking-[0.14em]">
            GPS: SIMULATED LOCK
          </div>
        </div>
      </header>

      {/* Main 3-Column Workspace */}
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[320px_1fr_360px] min-h-0 overflow-hidden bg-bg">
        <div className="min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border-strong)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
          <ProjectContextPanel project={project} scenario={scenario} />
        </div>
        <div className="min-h-0 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--border-strong)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
          <LiveWalkPanel projectId={project.id} scenario={scenario} />
        </div>
        <div className="min-h-0 overflow-y-auto pb-6 [scrollbar-width:thin] [scrollbar-color:var(--border-strong)_transparent] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border-strong [&::-webkit-scrollbar-track]:bg-transparent">
          <TruthGapPanel truthGap={truthGap} scenario={scenario} />
        </div>
      </main>

      {/* Bottom Full-width Evidence Timeline and Terminal */}
      <footer className={`shrink-0 border-t border-border bg-bg-card flex flex-col transition-all duration-300 ${isBottomCollapsed ? 'h-[36px]' : 'h-48 lg:h-[150px]'}`}>
        <div className="h-[36px] flex items-center justify-between px-4 border-b border-border shrink-0">
          <span className="text-[10px] font-mono tracking-[0.14em] uppercase text-text-muted">Evidence & Audit</span>
          <button 
            onClick={() => setIsBottomCollapsed(!isBottomCollapsed)}
            className="text-[10px] font-mono text-text-muted hover:text-text transition-colors"
          >
            {isBottomCollapsed ? 'EXPAND' : 'COLLAPSE'}
          </button>
        </div>
        
        {!isBottomCollapsed && (
          <div className="flex-1 grid grid-cols-[1fr_380px] overflow-hidden">
            <EvidenceTimeline activeIndex={timelineState} />
            <div className="p-4 flex flex-col overflow-y-auto relative [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-border-strong">
              <h4 className="text-[10px] font-mono tracking-[0.14em] uppercase text-text-muted mb-2 shrink-0">Audit Trace Terminal</h4>
              <div className="text-[10px] font-mono text-text-muted leading-relaxed opacity-60">
                <div>inspector@nigraani:~$ tail -f /var/log/audit.log</div>
                {auditLogs.slice(-200).map((log) => (
                  <LogLine key={log.id} log={log} />
                ))}
              </div>
            </div>
          </div>
        )}
      </footer>
    </div>
  );
}

export default function InspectionPage() {
  return (
    <Suspense fallback={<div className="h-dvh flex items-center justify-center bg-bg text-text">Loading...</div>}>
      <InspectionContent />
    </Suspense>
  );
}
