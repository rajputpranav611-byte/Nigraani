import Link from "next/link";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/moving-border";
import { Terminal } from "@/components/ui/terminal";

export default function LandingPage() {
  return (
    <AuroraBackground showRadialGradient={false}>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-bg to-transparent z-0 pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full h-full text-center mt-[-10vh]">
        {/* Vignette behind text */}
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,rgba(15,14,12,0)_0%,rgba(15,14,12,0.9)_80%)] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-center">
          {/* Brand Mark */}
          <div className="mb-6 inline-flex items-center gap-2 border border-border-strong bg-bg-raised px-4 py-1.5 rounded-full text-[11px] font-mono text-accent uppercase tracking-[0.14em]">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            NIGRAANI.SYS // v1.0
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl font-display font-semibold tracking-[-0.02em] text-text leading-[1.02] mb-6 max-w-4xl">
            Speak the site. Prove the work. <br />
            <span className="text-accent">Protect public money.</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-lg md:text-xl text-text/75 mb-12 max-w-2xl font-body font-normal">
            A voice-verified field inspection agent for public infrastructure.
          </p>
        </div>

        {/* CTAs */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-4 items-center justify-center mb-16">
          <Link href="/inspection">
            <Button 
              borderRadius="0.75rem" 
              containerClassName="h-[52px] min-w-[260px] rounded-xl"
              className="w-full h-full flex items-center justify-center px-7 bg-bg-raised border border-border-strong text-text font-mono uppercase tracking-[0.08em] text-[12px]"
              borderClassName="bg-accent"
            >
              LAUNCH FIELD DEMO
            </Button>
          </Link>
          <Link href="/demo">
            <button className="h-[52px] min-w-[260px] px-7 rounded-xl border border-border-strong bg-transparent text-text-muted hover:text-text transition-colors font-mono uppercase tracking-[0.08em] text-[12px] flex items-center justify-center">
              VIEW SUPERVISOR REPORT
            </button>
          </Link>
        </div>

        {/* Terminal Boot Sequence */}
        <div className="relative z-10 w-full max-w-2xl mx-auto opacity-80 text-left font-mono">
          <Terminal
            commands={[
              "nigraani connect --target wss://agents.assemblyai.com",
              "system.validate_baseline({ projectId: 'DR-14-09' })",
              "inspector.calibrate()",
              "inspector.listen()",
            ]}
            outputs={{
              0: [
                <span key="0" className="text-ok">✔ Connection established. Encrypted PCM 24kHz stream active.</span>,
              ],
              1: [<span key="1" className="text-ok">✔ Baseline loaded. 5 milestones tracked. Planned value: ₹1.8 Cr</span>],
              2: [<span key="2" className="text-ok">✔ GPS sync ok. Audio noise floor optimal.</span>],
              3: [<span key="3" className="text-ok">✔ Microphones active. Hardware AEC + AGC engaged.</span>, <span key="4" className="text-text">Waiting for observation...</span>],
            }}
            typingSpeed={30}
            delayBetweenCommands={800}
          />
        </div>
      </div>
    </AuroraBackground>
  );
}
