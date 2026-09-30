import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TruthGap } from "@/types/inspection";
import { AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";
import { CardSpotlight } from "@/components/ui/card-spotlight";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { TruthGapRing } from "@/components/ui/truth-gap-ring";
import { Button as MovingBorderButton } from "@/components/ui/moving-border";
import { motion } from "framer-motion";
import { useAppStore } from "@/lib/store";

export function TruthGapPanel({ truthGap, scenario }: { truthGap: any, scenario?: any }) {
  const inspectorConfirmation = useAppStore(state => state.inspectorConfirmation);
  const setInspectorConfirmation = useAppStore(state => state.setInspectorConfirmation);
  const dispatch = useAppStore(state => state.dispatch);
  const events = useAppStore(state => state.events);
  
  const hasReadback = events.some(e => e.type === "readback_confirmed");

  if (!truthGap) return null;

  const isIdle = truthGap.status === "AWAITING OBSERVATIONS";

  const handleSubmit = () => {
    if (hasReadback && inspectorConfirmation) {
      dispatch("report_submitted");
      window.location.href = `/report/${scenario.id}`;
    }
  };

  return (
    <Card className="min-h-full rounded-none border-0 border-l border-border bg-bg-raised text-text shadow-none flex flex-col font-body">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="text-[11px] tracking-[0.14em] text-text-muted uppercase font-mono">
          Truth Gap Engine
        </CardTitle>
      </CardHeader>
      
      <div className="flex-1">
        <div className="flex flex-col items-center justify-center py-8 p-6">
          <TruthGapRing 
            value={truthGap.score} 
            status={truthGap.status} 
            severity={truthGap.severity} 
          />
        </div>

        {truthGap.factors.length > 0 && (
          <div className="pt-6 border-t border-border px-6">
            <h3 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-4 text-text-muted">Risk Factors</h3>
            <div className="space-y-2">
              {truthGap.factors.map((factor: string, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.8 + i * 0.15, duration: 0.4 }}
                >
                  <CardSpotlight color="rgba(242,169,59,0.08)" radius={180} className="flex items-start gap-3 p-3 rounded-[10px] bg-bg-card border border-border">
                    <AlertTriangle size={16} className="text-warn mt-0.5 relative z-20" />
                    <span className="text-sm relative z-20 text-text">{factor}</span>
                  </CardSpotlight>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-6 mt-6 border-t border-border px-6 pb-6">
          <h3 className="text-[11px] font-mono tracking-[0.14em] uppercase mb-4 text-text-muted">Recommended Action</h3>
          <div className="p-4 text-text rounded-[10px] border" style={{ backgroundColor: 'rgba(127,166,201,0.08)', borderColor: 'rgba(127,166,201,0.30)' }}>
            <TextGenerateEffect words={truthGap.recommendedAction} className={`text-[14px] font-medium font-body ${isIdle ? 'opacity-50' : ''}`} duration={0.8} />
          </div>

          {!isIdle && (
            <div className="mt-4 flex items-center gap-2">
              <input 
                type="checkbox" 
                id="inspector-confirm"
                checked={inspectorConfirmation}
                onChange={(e) => setInspectorConfirmation(e.target.checked)}
                className="w-4 h-4 bg-bg border-border rounded text-accent focus:ring-accent accent-accent"
              />
              <label htmlFor="inspector-confirm" className="text-xs text-text-muted">
                I verify these findings are accurate
              </label>
            </div>
          )}

          <MovingBorderButton 
            disabled={isIdle || !hasReadback || !inspectorConfirmation}
            onClick={handleSubmit}
            borderRadius="12px"
            className="w-full px-4 py-3 bg-bg hover:bg-bg-card transition-colors rounded-xl font-mono uppercase tracking-[0.08em] text-[12px] text-text flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-0"
            borderClassName="bg-border"
          >
            <CheckCircle2 size={16} className={(!isIdle && hasReadback && inspectorConfirmation) ? "text-accent" : "text-text-muted"} />
            {hasReadback ? "CONFIRM AND SUBMIT" : "REVIEW STAGED ACTION"}
          </MovingBorderButton>
        </div>
      </div>
    </Card>
  );
}
