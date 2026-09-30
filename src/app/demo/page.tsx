import Link from "next/link";
import { CanvasRevealEffect } from "@/components/ui/canvas-reveal-effect";

export default function DemoPicker() {
  const scenarios = [
    {
      id: "A",
      title: "Progress Gap",
      desc: "Contractor claimed 65% progress. Inspector observes missing final drainage and safety barriers.",
      result: "Truth Gap 17% (High Risk) -> Supervisor review staged"
    },
    {
      id: "B",
      title: "Quality Issue",
      desc: "Inspector observes exposed reinforcement bars near the stairwell.",
      result: "Quality-control review staged -> Evidence requested"
    },
    {
      id: "C",
      title: "Clean Inspection",
      desc: "Pipeline work is complete and pressure test is documented.",
      result: "Truth Gap 2% (Low Risk) -> Routine report generated"
    },
    {
      id: "D",
      title: "Contradiction",
      desc: "Contractor claimed asphalt complete, but observed as gravel.",
      result: "Contractor clarification staged -> Payment certificate review suggested"
    }
  ];

  return (
    <div className="min-h-screen bg-bg text-text p-6 lg:p-12 font-body">
      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="text-text-muted hover:text-text mb-6 inline-block font-mono text-sm border border-border px-4 py-2 rounded-lg bg-bg-raised hover:bg-bg-card transition-colors">
          &larr; BACK TO TERMINAL
        </Link>
        <h1 className="text-4xl font-display font-semibold tracking-[-0.02em] mb-2">Demo Scenarios</h1>
        <p className="text-text-muted mb-8">Select a predefined state to load into the command center.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map(s => (
            <div key={s.id} className="group/card border border-border bg-bg-card p-5 rounded-xl flex flex-col h-full w-full relative overflow-hidden hover:border-border-strong hover:bg-[#1f1d18] transition-colors">
              <div className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-45 transition-opacity duration-500">
                <CanvasRevealEffect
                  colors={[[242, 169, 59], [181, 80, 42]]}
                  dotSize={2}
                  containerClassName="bg-transparent"
                />
                <div className="absolute inset-0 bg-transparent [mask-image:linear-gradient(to_bottom_right,black_0%,transparent_60%)] pointer-events-none" />
              </div>
              
              <div className="flex items-center gap-3 mb-3 relative z-10">
                <span className="w-8 h-8 rounded-full bg-accent-soft flex items-center justify-center font-mono font-bold text-accent">
                  {s.id}
                </span>
                <h2 className="text-xl font-display font-medium">{s.title}</h2>
              </div>
              <p className="text-text-muted text-sm mb-4 relative z-10 min-h-[40px]">{s.desc}</p>
              
              <div className="bg-bg p-4 rounded-lg border border-border mb-5 relative z-10 mt-auto min-h-[80px]">
                <p className="font-mono text-xs text-info uppercase tracking-[0.14em]">EXPECTED:</p>
                <p className="text-sm mt-1 text-text">{s.result}</p>
              </div>

              <Link href="/inspection" className="w-full block relative z-10">
                <button className="w-full py-3 rounded-lg bg-transparent text-accent border border-accent/35 hover:bg-accent hover:text-[#0F0E0C] hover:border-accent font-mono uppercase tracking-[0.08em] text-[12px] transition-all duration-150">
                  LOAD SCENARIO {s.id}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
