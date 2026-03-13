import React from "react";
import { cn, formatTimeMs } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface TimerDisplayProps {
  timeMs: number;
  showMs?: boolean;
  className?: string;
  isWarning?: boolean;
}

export function TimerDisplay({ timeMs, showMs = true, className, isWarning = false }: TimerDisplayProps) {
  const { hours, minutes, seconds, ms } = formatTimeMs(timeMs);

  return (
    <div className={cn("flex items-baseline justify-center font-mono select-none tracking-tight", className)}>
      <motion.div 
        animate={{ color: isWarning ? "hsl(var(--destructive))" : "hsl(var(--foreground))" }}
        className="flex items-baseline space-x-1 sm:space-x-2"
      >
        {hours !== "00" && (
          <>
            <span className="text-4xl sm:text-6xl md:text-7xl font-bold">{hours}</span>
            <span className="text-2xl sm:text-4xl text-muted-foreground pb-1 sm:pb-2">:</span>
          </>
        )}
        <span className="text-4xl sm:text-6xl md:text-7xl font-bold">{minutes}</span>
        <span className="text-2xl sm:text-4xl text-muted-foreground pb-1 sm:pb-2">:</span>
        <span className="text-4xl sm:text-6xl md:text-7xl font-bold">{seconds}</span>
        
        {showMs && (
          <span className="text-xl sm:text-3xl text-muted-foreground font-medium ml-1 sm:ml-2 pb-1 block w-[2ch] text-left">
            .{ms}
          </span>
        )}
      </motion.div>
    </div>
  );
}
