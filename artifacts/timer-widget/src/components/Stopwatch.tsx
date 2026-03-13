import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, Flag } from "lucide-react";
import { Button } from "./ui/button";
import { TimerDisplay } from "./TimerDisplay";
import { cn, formatTimeMs } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface LapData {
  id: number;
  timeMs: number;
  deltaMs: number;
}

export function Stopwatch() {
  const [timeMs, setTimeMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [laps, setLaps] = useState<LapData[]>([]);
  
  const startTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  const updateTimer = () => {
    if (startTimeRef.current) {
      setTimeMs(Date.now() - startTimeRef.current);
    }
    requestRef.current = requestAnimationFrame(updateTimer);
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(updateTimer);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isRunning]);

  const startStopwatch = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - timeMs;
      setIsRunning(true);
    }
  };

  const pauseStopwatch = () => {
    setIsRunning(false);
  };

  const resetStopwatch = () => {
    setIsRunning(false);
    setTimeMs(0);
    setLaps([]);
    startTimeRef.current = 0;
  };

  const addLap = () => {
    if (timeMs === 0) return;
    const previousLapTime = laps.length > 0 ? laps[0].timeMs : 0;
    const deltaMs = timeMs - previousLapTime;
    
    setLaps(prev => [{ id: Date.now(), timeMs, deltaMs }, ...prev]);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto relative pt-6">
      <div className="flex-none mb-8">
        <TimerDisplay timeMs={timeMs} className="mb-8" />
        
        <div className="grid grid-cols-2 gap-4 px-2">
          {isRunning ? (
            <Button onClick={pauseStopwatch} variant="secondary" size="lg" className="w-full">
              <Pause className="w-5 h-5 mr-2" /> Pause
            </Button>
          ) : (
            <Button onClick={startStopwatch} variant="default" size="lg" className="w-full bg-primary text-primary-foreground">
              <Play className="w-5 h-5 mr-2 ml-1" /> Start
            </Button>
          )}
          
          {isRunning ? (
            <Button onClick={addLap} variant="glass" size="lg" className="w-full">
              <Flag className="w-5 h-5 mr-2 text-muted-foreground" /> Lap
            </Button>
          ) : (
            <Button 
              onClick={resetStopwatch} 
              variant="glass" 
              size="lg" 
              className="w-full"
              disabled={timeMs === 0}
            >
              <Square className="w-5 h-5 mr-2 text-muted-foreground" /> Reset
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative rounded-2xl border border-border/50 bg-card/30">
        {laps.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm flex-col gap-2">
            <Flag className="w-8 h-8 opacity-20" />
            <p className="opacity-50">No laps recorded</p>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto px-4 py-2 no-scrollbar">
            <AnimatePresence initial={false}>
              {laps.map((lap, index) => {
                const { hours: lH, minutes: lM, seconds: lS, ms: lMs } = formatTimeMs(lap.timeMs);
                const { hours: dH, minutes: dM, seconds: dS, ms: dMs } = formatTimeMs(lap.deltaMs);
                
                const lapNum = laps.length - index;
                
                return (
                  <motion.div
                    key={lap.id}
                    initial={{ opacity: 0, y: -20, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center justify-between py-3 border-b border-border/40 last:border-0 font-mono text-sm sm:text-base"
                  >
                    <span className="text-muted-foreground w-12">#{lapNum.toString().padStart(2, '0')}</span>
                    <span className="text-foreground flex-1 text-center">
                      {lH !== "00" ? `${lH}:` : ""}{lM}:{lS}.<span className="text-xs text-muted-foreground">{lMs}</span>
                    </span>
                    <span className="text-primary w-24 text-right">
                      +{dH !== "00" ? `${dH}:` : ""}{dM}:{dS}.<span className="text-xs opacity-70">{dMs}</span>
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
