import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, Square, BellRing } from "lucide-react";
import { Button } from "./ui/button";
import { TimerDisplay } from "./TimerDisplay";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function Countdown() {
  const [inputH, setInputH] = useState("00");
  const [inputM, setInputM] = useState("05");
  const [inputS, setInputS] = useState("00");

  const [remainingMs, setRemainingMs] = useState(0);
  const [totalMs, setTotalMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  
  const endTimeRef = useRef<number>(0);
  const requestRef = useRef<number | null>(null);

  const calculateTotalInputMs = () => {
    const h = parseInt(inputH) || 0;
    const m = parseInt(inputM) || 0;
    const s = parseInt(inputS) || 0;
    return (h * 3600 + m * 60 + s) * 1000;
  };

  const updateTimer = () => {
    if (endTimeRef.current) {
      const now = Date.now();
      const left = Math.max(0, endTimeRef.current - now);
      setRemainingMs(left);
      
      if (left === 0) {
        setIsRunning(false);
        setIsFinished(true);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        return;
      }
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

  const startCountdown = () => {
    if (isFinished) {
      resetCountdown();
      return;
    }
    
    if (!isRunning) {
      let currentTotal = totalMs;
      let currentRemaining = remainingMs;

      // If starting fresh from inputs
      if (remainingMs === 0) {
        const ms = calculateTotalInputMs();
        if (ms === 0) return; // don't start if 0
        currentTotal = ms;
        currentRemaining = ms;
        setTotalMs(ms);
      }

      endTimeRef.current = Date.now() + currentRemaining;
      setIsRunning(true);
    }
  };

  const pauseCountdown = () => {
    setIsRunning(false);
  };

  const resetCountdown = () => {
    setIsRunning(false);
    setIsFinished(false);
    setRemainingMs(0);
    setTotalMs(0);
    endTimeRef.current = 0;
  };

  const handleInputBlur = (setter: React.Dispatch<React.SetStateAction<string>>, val: string) => {
    const num = parseInt(val) || 0;
    setter(Math.max(0, Math.min(num, 99)).toString().padStart(2, "0"));
  };

  const progress = totalMs > 0 ? ((totalMs - remainingMs) / totalMs) * 100 : 0;
  const isSetupMode = remainingMs === 0 && !isRunning && !isFinished;

  return (
    <div className="flex flex-col h-full w-full max-w-md mx-auto pt-6 relative">
      
      {/* Progress Bar (Absolute positioned at top of container) */}
      {!isSetupMode && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-secondary rounded-full overflow-hidden">
          <motion.div 
            className={cn("h-full", isFinished ? "bg-destructive" : "bg-primary")}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      )}

      <div className="flex-1 flex flex-col justify-center mb-8 relative">
        <AnimatePresence mode="wait">
          {isFinished ? (
            <motion.div 
              key="finished"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="flex flex-col items-center justify-center py-8"
            >
              <motion.div 
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                className="w-20 h-20 rounded-full bg-destructive/20 flex items-center justify-center mb-6 text-destructive"
              >
                <BellRing className="w-10 h-10" />
              </motion.div>
              <h2 className="text-3xl font-bold text-destructive tracking-tight mb-2">Time's Up!</h2>
              <p className="text-muted-foreground">The countdown has finished.</p>
            </motion.div>
          ) : isSetupMode ? (
            <motion.div 
              key="setup"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center space-x-2 sm:space-x-4 mb-4"
            >
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  value={inputH}
                  onChange={(e) => setInputH(e.target.value)}
                  onBlur={(e) => handleInputBlur(setInputH, e.target.value)}
                  className="w-16 sm:w-24 h-16 sm:h-24 bg-card border border-border rounded-2xl text-center text-4xl sm:text-5xl font-mono text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  max="99"
                  min="0"
                />
                <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Hours</span>
              </div>
              <span className="text-3xl sm:text-5xl text-muted-foreground pb-6">:</span>
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  value={inputM}
                  onChange={(e) => setInputM(e.target.value)}
                  onBlur={(e) => handleInputBlur(setInputM, e.target.value)}
                  className="w-16 sm:w-24 h-16 sm:h-24 bg-card border border-border rounded-2xl text-center text-4xl sm:text-5xl font-mono text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  max="59"
                  min="0"
                />
                <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Mins</span>
              </div>
              <span className="text-3xl sm:text-5xl text-muted-foreground pb-6">:</span>
              <div className="flex flex-col items-center">
                <input
                  type="number"
                  value={inputS}
                  onChange={(e) => setInputS(e.target.value)}
                  onBlur={(e) => handleInputBlur(setInputS, e.target.value)}
                  className="w-16 sm:w-24 h-16 sm:h-24 bg-card border border-border rounded-2xl text-center text-4xl sm:text-5xl font-mono text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                  max="59"
                  min="0"
                />
                <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider font-semibold">Secs</span>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="running"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-10"
            >
              <TimerDisplay timeMs={remainingMs} showMs={false} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex-none px-2 pb-6">
        {isFinished ? (
          <Button onClick={resetCountdown} variant="default" size="lg" className="w-full bg-primary text-primary-foreground">
            Done
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {isRunning ? (
              <Button onClick={pauseCountdown} variant="secondary" size="lg" className="w-full">
                <Pause className="w-5 h-5 mr-2" /> Pause
              </Button>
            ) : (
              <Button onClick={startCountdown} variant="default" size="lg" className="w-full bg-primary text-primary-foreground">
                <Play className="w-5 h-5 mr-2 ml-1" /> {remainingMs > 0 ? "Resume" : "Start"}
              </Button>
            )}
            
            <Button 
              onClick={resetCountdown} 
              variant="glass" 
              size="lg" 
              className="w-full"
              disabled={isSetupMode}
            >
              <Square className="w-5 h-5 mr-2 text-muted-foreground" /> Reset
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
