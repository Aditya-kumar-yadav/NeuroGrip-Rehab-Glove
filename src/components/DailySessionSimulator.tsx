import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  TrendingUp, 
  Award, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { Exercise, SessionLog } from '../types';

interface DailySessionSimulatorProps {
  exercise: Exercise;
  onSessionComplete: (newLog: SessionLog) => void;
  onClose: () => void;
}

export default function DailySessionSimulator({ 
  exercise, 
  onSessionComplete, 
  onClose 
}: DailySessionSimulatorProps) {
  // Simulator states
  const [isActive, setIsActive] = useState<boolean>(false);
  const [currentRep, setCurrentRep] = useState<number>(0);
  const [currentForce, setCurrentForce] = useState<number>(0);
  const [isPressing, setIsPressing] = useState<boolean>(false);
  
  // Phase of the currently active repetition
  // 'idle' -> rest phase
  // 'squeezing' -> patient is squeezing
  // 'holding' -> static hold phase (for hold exercises)
  // 'releasing' -> slow release phase
  // 'success' -> completed repetition
  const [phase, setPhase] = useState<'idle' | 'squeeze-prompt' | 'squeezing' | 'holding' | 'releasing' | 'success'>('idle');
  
  // Measurement tracking
  const [peakForce, setPeakForce] = useState<number>(0);
  const [recordedForces, setRecordedForces] = useState<number[]>([]);
  const [jitterCount, setJitterCount] = useState<number>(0); // tremor detection simulation
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio oscillator simulation for accessible feedback
  const playAccessibilityTone = (frequency: number, duration: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      
      // Keep volume extremely soft for clinical relaxation
      gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio context might be blocked or unsupported; ignore silently
    }
  };

  // Start the clinical session
  const startSession = () => {
    setIsActive(true);
    setCurrentRep(1);
    setIsPressing(false);
    setCurrentForce(0);
    setPeakForce(0);
    setRecordedForces([]);
    setJitterCount(0);
    setElapsedTime(0);
    
    // Start total clinical duration timer
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    sessionTimerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Trigger prompt
    triggerNextPhase('squeeze-prompt', 0);
  };

  const triggerNextPhase = (nextPhase: typeof phase, delaySec: number) => {
    setPhase(nextPhase);
    if (nextPhase === 'squeeze-prompt') {
      playAccessibilityTone(520, 0.15); // Friendly "squeeee" tone
    } else if (nextPhase === 'success') {
      playAccessibilityTone(659, 0.25); // Encouraging success chime
    }
  };

  // Simulate force dynamics
  useEffect(() => {
    let animationFrameId: number;
    
    const simulateForceChanges = () => {
      if (isActive) {
        let targetVal = 0;
        
        // Squeeze reaction
        if (isPressing) {
          // Max limits depend on exercise type
          const maxLimit = exercise.type === 'precision' ? 7 : 18;
          targetVal = maxLimit * 0.95; // peak simulation target
        } else {
          targetVal = 0;
        }

        // Add physical raw jitter/tremor to represent real stroke patient feedback
        const noise = isPressing ? (Math.random() - 0.5) * 1.5 : 0;
        if (isPressing && Math.abs(noise) > 0.4) {
          setJitterCount(prev => prev + 1);
        }

        setCurrentForce(prev => {
          const rawForce = prev + (targetVal - prev) * 0.15 + noise;
          const cleanForce = Math.max(0, parseFloat(rawForce.toFixed(1)));
          
          if (cleanForce > peakForce) {
            setPeakForce(cleanForce);
          }
          
          return cleanForce;
        });
      } else {
        setCurrentForce(0);
      }
      
      animationFrameId = requestAnimationFrame(simulateForceChanges);
    };

    simulateForceChanges();
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPressing, isActive, peakForce, exercise]);

  // Handle phase durations and auto-advancements
  useEffect(() => {
    if (!isActive) return;

    if (phase === 'squeeze-prompt') {
      // Waiting for player to press space or mouse down
      if (currentForce > 2.0 && isPressing) {
        if (exercise.type === 'hold') {
          setPhase('holding');
          setSecondsRemaining(5); // Hold for 5 seconds
        } else {
          setPhase('squeezing');
          // Squeeze exercises are momentary
          setSecondsRemaining(3);
        }
      }
    }

    if (phase === 'holding') {
      // Keep checking if they stay in target force zone (e.g. 7kg to 13kg)
      const intervalSec = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalSec);
            triggerNextPhase('releasing', 0);
            return 0;
          }
          // Record current force to log statistics
          setRecordedForces(f => [...f, currentForce]);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalSec);
    }

    if (phase === 'squeezing') {
      const intervalSec = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            clearInterval(intervalSec);
            triggerNextPhase('releasing', 0);
            return 0;
          }
          setRecordedForces(f => [...f, currentForce]);
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(intervalSec);
    }

    if (phase === 'releasing') {
      // Must release below 1.5 kg to secure repetition control
      if (currentForce < 1.5) {
        setPhase('success');
      }
    }

    if (phase === 'success') {
      const timeout = setTimeout(() => {
        if (currentRep < exercise.targetReps) {
          setCurrentRep(r => r + 1);
          triggerNextPhase('squeeze-prompt', 0);
        } else {
          // Finished all required repetitions!
          finishSession();
        }
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [isActive, phase, currentForce, isPressing]);

  const finishSession = () => {
    setIsActive(false);
    if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    
    // Process clinical statistics
    const finalReps = exercise.targetReps;
    const finalDuration = elapsedTime || 180;
    const finalAvg = recordedForces.length > 0 
      ? parseFloat((recordedForces.reduce((a, b) => a + b, 0) / recordedForces.length).toFixed(1))
      : parseFloat((exercise.avgGoalKg * (0.85 + Math.random() * 0.25)).toFixed(1));
    const finalMax = Math.max(peakForce, exercise.avgGoalKg + 2.1);
    
    // Tremor index based on recorded jitters
    const tremorIndex = Math.min(10, Math.max(1, Math.round(jitterCount / 35)));

    // Create custom dynamic clinical comment based on neurological stats
    let performanceComment = '';
    if (tremorIndex < 3) {
      performanceComment = 'Outstanding steady grip contraction. Motor accuracy is highly stable today!';
    } else if (tremorIndex < 6) {
      performanceComment = 'Adequate grip output with mild baseline spasticity. Continuous holds show progressive coordination.';
    } else {
      performanceComment = 'Mild neurological tremor noticed during force maintenance. Make sure to rest fully between contractions.';
    }

    const newLog: SessionLog = {
      id: `log-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      repsDone: finalReps,
      targetReps: exercise.targetReps,
      durationSec: finalDuration,
      avgForceKg: finalAvg,
      maxForceKg: parseFloat(finalMax.toFixed(1)),
      tremorIndex: tremorIndex,
      notes: performanceComment,
      successRate: Math.round(85 + Math.random() * 15)
    };

    onSessionComplete(newLog);
  };

  useEffect(() => {
    return () => {
      if (sessionTimerRef.current) clearInterval(sessionTimerRef.current);
    };
  }, []);

  // Keyboard handlers to simulate squeeze device using clinical spacebar trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPressing(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.code === 'Space') {
        e.preventDefault();
        setIsPressing(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div id="therapy-simulator-modal" className="bg-white rounded-xl border border-outline-variant shadow-md p-6 relative overflow-hidden transition-all duration-300">
      
      {/* Top clinical status header */}
      <div className="flex justify-between items-center pb-4 mb-4 border-b border-surface-container-highest">
        <div>
          <span className={`px-2.5 py-1 text-xs font-bold rounded-full mr-2 ${exercise.badgeClass}`}>
            Interactive Session
          </span>
          <h3 className="font-headline-md text-primary mt-1">{exercise.name}</h3>
        </div>
        <button 
          id="close-simulation-btn"
          onClick={onClose} 
          className="p-2 text-on-surface-variant hover:bg-surface-container rounded-full touch-optimized"
          title="Exit Session"
        >
          ✕
        </button>
      </div>

      {!isActive ? (
        // Start/Pre-session Screen
        <div id="pre-session-screen" className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-16 h-16 bg-primary-fixed rounded-full flex items-center justify-center mb-4 text-primary">
            <Activity size={32} />
          </div>
          
          <h4 className="font-bold text-lg text-on-surface mb-2">Ready to Start Alex&apos;s Daily Session?</h4>
          <p className="font-body-md text-on-surface-variant max-w-[500px] mb-6">
            This module simulates continuous muscular coordination. You will grip the device
            (by **holding the controller button** or **holding down the Spacebar** on your keyboard) 
            to hit calibrated target levels.
          </p>

          {/* Instructions Box */}
          <div className="bg-surface-container-low p-4 rounded-lg w-full text-left border border-outline-variant/60 mb-6 max-h-[180px] overflow-y-auto">
            <span className="font-bold text-xs uppercase tracking-wide text-primary">Patient Instructions</span>
            <ul className="list-decimal pl-5 mt-2 space-y-1 text-sm text-on-surface font-sans">
              {exercise.instructions.map((inst, index) => (
                <li key={index} className="leading-relaxed">{inst}</li>
              ))}
            </ul>
          </div>

          <div className="flex gap-4 w-full">
            <button
              id="cancel-session-btn"
              onClick={onClose}
              className="flex-1 py-3 border-2 border-outline text-on-surface-variant hover:bg-surface-container-low font-bold rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              id="start-clinical-btn"
              onClick={startSession}
              className="flex-1 py-3 bg-primary text-on-primary hover:bg-primary-container font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Play size={18} fill="currentColor" />
              Begin Therapy Session
            </button>
          </div>
        </div>
      ) : (
        // Active Session Screen
        <div id="active-session-screen" className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
          
          {/* Graphical Feedback Gauge Column */}
          <div className="flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-surface-container-highest pb-6 md:pb-0 md:pr-6">
            <div className="relative w-48 h-48 flex items-center justify-center">
              
              {/* Force Circular visualizer */}
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                {/* Background track */}
                <circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  stroke="#e1e3e4" 
                  strokeWidth="12" 
                  fill="transparent" 
                />
                
                {/* Target Zone Arc Helper (hold goal is ~10kg) */}
                {exercise.type === 'hold' && (
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="80" 
                    stroke="#ffd489" 
                    strokeWidth="12" 
                    fill="transparent" 
                    strokeDasharray="502" 
                    strokeDashoffset="280" // approximate arc highlighting target zone
                    className="opacity-40"
                  />
                )}
                
                {/* Active squeeze force indicator */}
                <circle 
                  cx="96" 
                  cy="96" 
                  r="80" 
                  stroke={phase === 'holding' ? '#006d33' : '#005eb8'} 
                  strokeWidth="12" 
                  fill="transparent" 
                  strokeDasharray="502"
                  // Calculate percentage based on current simulated max force
                  strokeDashoffset={Math.max(0, 502 - (502 * Math.min(currentForce, 20)) / 20)}
                  className="transition-all duration-75 ease-out"
                />
              </svg>

              {/* Central text display */}
              <div className="text-center z-10">
                <span className="text-xs text-on-surface-variant font-bold uppercase tracking-wider block">Force</span>
                <div id="current-force-readout" className="text-4xl font-extrabold text-on-surface leading-none py-1">
                  {currentForce}
                </div>
                <span className="text-sm font-bold text-on-surface-variant">kg</span>
              </div>
            </div>

            {/* Hold Indicator or Prompt Text */}
            <div className="mt-4 text-center">
              <span className="text-xs font-bold text-on-surface-variant block uppercase tracking-wide">
                Target Objective: {exercise.avgGoalKg} kg
              </span>
              <p className="text-sm font-bold mt-1 text-primary-container h-6 flex items-center justify-center">
                {isPressing ? 'Contraction Logged ✓' : 'Awaiting Squeeze input'}
              </p>
            </div>
          </div>

          {/* Interactive Controller & Status Indicators */}
          <div className="flex flex-col justify-between">
            {/* Clinical Feedback prompt box */}
            <div className="bg-surface-container p-4 rounded-xl border border-outline-variant flex flex-col justify-between min-h-[140px]">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                    Instructional Prompt
                  </span>
                  <span className="text-xs font-bold text-primary">
                    Repetition {currentRep} / {exercise.targetReps}
                  </span>
                </div>
                
                {/* Dynamic Instructions */}
                <div className="mt-3">
                  {phase === 'squeeze-prompt' && (
                    <div className="text-amber-800 flex items-start gap-2">
                      <AlertCircle className="shrink-0 mt-0.5 animate-pulse" size={18} />
                      <div>
                        <p className="font-bold text-base leading-snug">SQUEEZE NOW</p>
                        <p className="text-xs mt-0.5">Press & hold the blue pad below or your keyboard **Spacebar**.</p>
                      </div>
                    </div>
                  )}

                  {phase === 'holding' && (
                    <div className="text-emerald-800 flex items-start gap-2">
                      <Activity className="shrink-0 mt-0.5 animate-spin" style={{ animationDuration: '4s' }} size={18} />
                      <div>
                        <p className="font-bold text-base leading-snug">STEADY HOLD</p>
                        <p className="text-xs mt-0.5">Maintain contraction force in target zone! Remaining: **{secondsRemaining}s**</p>
                      </div>
                    </div>
                  )}

                  {phase === 'squeezing' && (
                    <div className="text-primary flex items-start gap-2">
                      <Activity className="shrink-0 mt-0.5 animate-bounce" size={18} />
                      <div>
                        <p className="font-bold text-base leading-snug">MAINTAIN FORCE</p>
                        <p className="text-xs mt-0.5">Keep squeezing firmly... ({secondsRemaining}s remaining)</p>
                      </div>
                    </div>
                  )}

                  {phase === 'releasing' && (
                    <div className="text-indigo-800 flex items-start gap-2">
                      <TrendingUp className="shrink-0 mt-0.5 -scale-y-100" size={18} />
                      <div>
                        <p className="font-bold text-base leading-snug">CONTROLLED RELEASE</p>
                        <p className="text-xs mt-0.5">Slowly relax your hand to complete muscle deceleration.</p>
                      </div>
                    </div>
                  )}

                  {phase === 'success' && (
                    <div className="text-emerald-700 flex items-start gap-2">
                      <CheckCircle2 className="shrink-0 mt-0.5" size={18} />
                      <div>
                        <p className="font-bold text-base leading-snug">EXCELLENT REPETITION!</p>
                        <p className="text-xs mt-0.5">Good tracking and control. Rest 1 second...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress counter pill bars */}
              <div className="mt-4">
                <div className="flex gap-1.5 h-2 w-full bg-surface-container-highest rounded-full overflow-hidden">
                  {Array.from({ length: exercise.targetReps }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`h-full flex-1 transition-all ${
                        i < currentRep - 1 || (i === currentRep - 1 && phase === 'success')
                          ? 'bg-secondary' 
                          : i === currentRep - 1 
                          ? 'bg-primary animate-pulse' 
                          : 'bg-outline/20'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1 text-[11px] text-on-surface-variant">
                  <span>Session Start</span>
                  <span>{100 - Math.round((currentRep / exercise.targetReps) * 100)}% remaining</span>
                </div>
              </div>
            </div>

            {/* Virtual Grip Controller Pad Area */}
            <div className="mt-6 flex flex-col gap-2">
              <span className="text-xs font-bold text-on-surface-variant flex items-center gap-1">
                <HelpCircle size={13} />
                Biofeedback Controller Pad Emulation
              </span>
              
              <button
                id="squeeze-pad-trigger"
                onMouseDown={() => setIsPressing(true)}
                onMouseUp={() => setIsPressing(false)}
                onMouseLeave={() => setIsPressing(false)}
                onTouchStart={(e) => { e.preventDefault(); setIsPressing(true); }}
                onTouchEnd={(e) => { e.preventDefault(); setIsPressing(false); }}
                className={`w-full py-7 rounded-xl font-bold text-lg select-none transition-all flex flex-col items-center justify-center gap-1 active:scale-[0.97] touch-optimized shadow-inner border ${
                  isPressing 
                    ? 'bg-secondary text-white border-secondary-container scale-[0.98]' 
                    : 'bg-primary text-white border-primary-container hover:bg-primary-container'
                }`}
              >
                <span>{isPressing ? 'SQUEEZING CONTROLLER...' : 'PRESS & HOLD TO SQUEEZE'}</span>
                <span className="text-[10px] font-normal opacity-90 block">Or press down Spacebar keyboard key</span>
              </button>
            </div>

          </div>

        </div>
      )}

      {/* Decorative pulse glow */}
      {isActive && isPressing && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary animate-pulse" />
      )}
    </div>
  );
}
