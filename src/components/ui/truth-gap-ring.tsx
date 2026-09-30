"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ShieldCheck } from "lucide-react";

export function TruthGapRing({ value, max = 50, status, severity }: { value: number; max?: number; status: string; severity?: string }) {
  const isIdle = value === 0 && status === "AWAITING OBSERVATIONS";
  
  const [currentValue, setCurrentValue] = useState(0);
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, Math.round);
  
  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration: 1.8,
      ease: [0.22, 1, 0.36, 1],
    });
    
    motionValue.on("change", (v) => setCurrentValue(v));
    return () => controls.stop();
  }, [value, motionValue]);

  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = useTransform(motionValue, (v) => Math.max(0, circumference - (circumference * v) / max));

  const getColor = (v: number) => {
    if (v === 0) return "rgba(236, 228, 212, 0.18)";
    if (v < 5) return "#8DB27A";
    if (v <= 10) return "#E0A03A";
    if (v <= 20) return "#D9822B";
    return "#E5533D";
  };

  const currentColor = getColor(value);

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative w-48 h-48 flex items-center justify-center mb-6">
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle cx="96" cy="96" r="80" stroke="rgba(236,228,212,0.08)" strokeWidth="10" fill="none" />
          
          <motion.circle 
            cx="96" 
            cy="96" 
            r="80" 
            stroke={currentColor} 
            strokeWidth="10" 
            fill="none" 
            strokeDasharray={circumference}
            style={{ strokeDashoffset }}
            initial={{ strokeDashoffset: circumference }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />

          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={i}
              x1="96" y1="6" x2="96" y2="12"
              stroke="var(--text)"
              strokeWidth="2"
              strokeOpacity="0.25"
              transform={`rotate(${i * 36} 96 96)`}
            />
          ))}
        </svg>

        <motion.div 
          className="absolute inset-0 w-full h-full"
          style={{ rotate: useTransform(motionValue, v => (v / max) * 360) }}
        >
          {value > 0 && (
            <div 
              className="absolute top-[13px] left-1/2 -ml-[3px] w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </motion.div>

        <div className="flex flex-col items-center z-10 font-body">
          <motion.span className="text-5xl font-display font-semibold tabular-nums" style={{ color: currentColor }}>
            {Math.round(currentValue)}%
          </motion.span>
          <div className="text-[11px] text-text-muted uppercase font-mono tracking-[0.14em] mt-1 relative h-4 overflow-hidden w-full text-center">
            <motion.span 
              className="absolute inset-x-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: isIdle ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              AWAITING OBSERVATIONS
            </motion.span>
            <motion.span 
              className="absolute inset-x-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: !isIdle ? 1 : 0 }}
              transition={{ duration: 0.3 }}
            >
              GAP DETECTED
            </motion.span>
          </div>
        </div>
      </div>
      
      {!isIdle && (
        <motion.div 
          className="flex flex-col gap-2 items-center"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.4 }}
        >
          <Badge 
            variant="outline" 
            className="font-mono text-[12px] uppercase tracking-[0.08em] px-4 py-1 flex gap-2 items-center border-current bg-transparent"
            style={{ color: currentColor, backgroundColor: `${currentColor}15` }}
          >
            {value > 0 ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
            {status}
          </Badge>
          {severity && severity !== "NONE" && (
            <Badge 
              variant="outline" 
              className="font-mono text-[11px] uppercase tracking-[0.14em] px-3 py-0.5 border-current bg-transparent"
              style={{ color: currentColor }}
            >
              SEVERITY: {severity}
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}
