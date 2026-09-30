"use client";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const NODES = [
  'Voice Observation',
  'Claim Extraction',
  'Evidence Upload',
  'Truth Gap',
  'Read-Back',
  'Escalation Staged'
];

export function EvidenceTimeline({ activeIndex = -1 }: { activeIndex?: number }) {
  // A mock auto-advance just for demo purposes, if activeIndex isn't managed
  const [current, setCurrent] = useState(activeIndex);
  
  useEffect(() => {
    if (activeIndex !== -1) {
      setTimeout(() => setCurrent(activeIndex), 0);
    }
  }, [activeIndex]);

  // Total width of the connecting line represents 100% across the container
  // ScaleX represents the progress. If there are N nodes, max index is N-1.
  const progress = current >= 0 ? current / (NODES.length - 1) : 0;

  return (
    <div className="flex flex-col justify-center h-full border-r border-border relative overflow-hidden p-4">
      <h4 className="text-[10px] font-mono tracking-[0.14em] uppercase text-text-muted mb-4">Evidence Timeline</h4>
      
      <div className="flex items-center justify-between px-8 relative z-10">
        {NODES.map((node, i) => {
          const isActive = i <= current;
          return (
            <div key={i} className="flex flex-col items-center gap-2 group cursor-pointer relative z-20">
              <motion.div 
                className={`w-3 h-3 rounded-full border transition-colors duration-500`}
                animate={{
                  backgroundColor: isActive ? '#F2A93B' : '#171512',
                  borderColor: isActive ? '#F2A93B' : 'rgba(236,228,212,0.10)'
                }}
              />
              <motion.span 
                className="text-[10px] font-mono uppercase text-center w-20 leading-tight transition-colors duration-500"
                animate={{
                  color: isActive ? '#ECE4D4' : '#9A9384'
                }}
              >
                {node}
              </motion.span>
            </div>
          );
        })}
        
        {/* Background Track */}
        <div className="absolute top-1.5 left-[44px] right-[44px] h-px bg-border -z-10" />
        
        {/* Active Animated Track */}
        <div className="absolute top-1.5 left-[44px] right-[44px] h-px origin-left -z-10 overflow-hidden">
           <motion.div 
             className="w-full h-full bg-accent"
             initial={{ scaleX: 0 }}
             animate={{ scaleX: progress }}
             transition={{ duration: 0.5, ease: "easeOut" }}
             style={{ originX: 0 }}
           />
        </div>
      </div>
    </div>
  );
}
