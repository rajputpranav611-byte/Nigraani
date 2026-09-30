import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Project } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";


import { CardSpotlight } from "@/components/ui/card-spotlight";

export function ProjectContextPanel({ project, scenario }: { project: Project, scenario?: any }) {
  if (!project || !scenario) return null;

  return (
    <Card className="min-h-full rounded-none border-0 border-r border-border bg-bg-raised text-text shadow-none flex flex-col font-body">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-[11px] tracking-[0.14em] text-text-muted uppercase font-mono">
          Project Context
        </CardTitle>
        <h2 className="text-2xl font-display font-medium mt-2 text-text">{project.name}</h2>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="border-border text-accent bg-bg-card font-mono text-[11px]">
            {project.id}
          </Badge>
          <Badge variant="outline" className="border-border text-text-muted bg-bg-card text-[11px] font-mono">
            {project.location}
          </Badge>
        </div>
      </CardHeader>
      
      <div className="flex-1">
        <div className="p-6 space-y-8">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-text-muted mb-1 text-[11px] uppercase font-mono tracking-[0.14em]">Contractor</p>
              <p className="font-medium text-text">{project.contractor}</p>
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[11px] uppercase font-mono tracking-[0.14em]">Value</p>
              <p className="font-medium font-mono text-text">{(project as any).value || (project as any).approvedValue}</p>
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[11px] uppercase font-mono tracking-[0.14em]">PLANNED PROGRESS</p>
              <p className="font-medium font-mono text-text">{scenario.claimedProgress}%</p>
            </div>
            <div>
              <p className="text-text-muted mb-1 text-[11px] uppercase font-mono tracking-[0.14em]">REPORTED PROGRESS</p>
              <p className="font-medium font-mono text-text">{scenario.claimedProgress}%</p>
            </div>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-3 text-text-muted">Prior Inspection Summary</h3>
            <p className="font-display italic text-[15px] text-text-muted border-l-2 border-accent pl-3">
              &quot;{scenario.priorInspection}&quot;
            </p>
          </div>

          <div className="pt-6 border-t border-border">
            <h3 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-4 text-text-muted">Milestone Status</h3>
            <div className="space-y-3">
            {scenario.milestones.map((milestone: any) => (
              <CardSpotlight key={milestone.id} color="rgba(242,169,59,0.08)" radius={180} className="flex items-center justify-between p-3 rounded-[10px] bg-bg-card border border-border overflow-hidden">
                <div className="flex flex-col relative z-20">
                  <span className="text-sm font-medium text-text">{milestone.name}</span>
                  <span className="text-[10px] text-text-muted font-mono">{milestone.completion}% COMPLETE ({milestone.weight}% WEIGHT)</span>
                </div>
                <Badge 
                  variant="outline" 
                  className={`font-mono text-[11px] border border-border relative z-20 uppercase ${
                    milestone.status === 'verified' ? 'text-ok bg-ok/10 border-ok/30' :
                    milestone.status === 'missing' || milestone.status === 'unbuilt' ? 'text-danger bg-danger/10 border-danger/30' :
                    milestone.status === 'incomplete' ? 'text-orange bg-orange/10 border-orange/30' :
                    'text-warn bg-warn/10 border-warn/30'
                  }`}
                >
                  {milestone.status}
                </Badge>
              </CardSpotlight>
            ))}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
