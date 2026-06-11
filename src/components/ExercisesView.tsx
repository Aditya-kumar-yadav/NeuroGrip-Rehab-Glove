import React, { useState } from 'react';
import { 
  Play, 
  Dumbbell, 
  Timer, 
  Zap, 
  Target, 
  CheckCircle2, 
  ChevronRight, 
  Sliders, 
  ShieldAlert,
  Flame,
  Gauge
} from 'lucide-react';
import { Exercise, SessionLog } from '../types';
import DailySessionSimulator from './DailySessionSimulator';

interface ExercisesViewProps {
  exercises: Exercise[];
  baselineStrengthKg: number;
  onAddSessionLog: (newLog: SessionLog) => void;
}

export default function ExercisesView({ 
  exercises, 
  baselineStrengthKg,
  onAddSessionLog 
}: ExercisesViewProps) {
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [resistanceLevel, setResistanceLevel] = useState<'gentle' | 'moderate' | 'firm' | 'intensive'>('moderate');
  const [sessionCompletedNotice, setSessionCompletedNotice] = useState<SessionLog | null>(null);

  // Helper to map Lucide icon names dynamically
  const renderExerciseIcon = (iconName: string) => {
    switch (iconName) {
      case 'dumbbell': return <Dumbbell size={22} />;
      case 'timer': return <Timer size={22} />;
      case 'zap': return <Zap size={22} />;
      case 'target': return <Target size={22} />;
      default: return <Dumbbell size={22} />;
    }
  };

  // Safe baseline-adjusted target loads
  const getSimulatedTargetKg = (baseTarget: number) => {
    let multiplier = 1.0;
    switch (resistanceLevel) {
      case 'gentle': multiplier = 0.5; break;
      case 'moderate': multiplier = 0.85; break;
      case 'firm': multiplier = 1.25; break;
      case 'intensive': multiplier = 1.6; break;
    }
    return parseFloat((baseTarget * multiplier).toFixed(1));
  };

  const handleStartExercise = (ex: Exercise) => {
    // Generate adjusted exercise parameters based on patient setting
    const adjustedKg = getSimulatedTargetKg(ex.avgGoalKg);

    // Deep copy exercise to adjust target average goals
    const adjustedExercise: Exercise = {
      ...ex,
      avgGoalKg: adjustedKg
    };
    
    setSessionCompletedNotice(null);
    setSelectedExercise(adjustedExercise);
  };

  const handleCompleteSession = (newLog: SessionLog) => {
    onAddSessionLog(newLog);
    setSessionCompletedNotice(newLog);
    setSelectedExercise(null);
  };

  return (
    <div id="exercises-view-container" className="space-y-8 animate-fade-in text-left">
      
      {/* Selection detail banner */}
      <section className="mb-4">
        <h2 className="text-2xl font-bold text-on-surface">Therapeutic Exercises</h2>
        <p className="text-on-surface-variant text-base mt-1">
          Pick a calibrated grip regime prescribed by your physical therapist. Each program targets specific neuromuscular pathways.
        </p>
      </section>

      {/* Adjust difficulty control */}
      <section className="card-surface p-5 rounded-xl bg-surface-container-low border border-outline-variant/60">
        <div className="flex items-center gap-2 text-primary mb-3">
          <Sliders size={20} />
          <span className="font-bold text-[15px] uppercase tracking-wider">Calibration Load Factor</span>
        </div>
        <p className="text-xs text-on-surface-variant mb-4">
          Adjust the force target difficulty based on your hand fatigue index today. Safe boundaries prevent muscle overexertion.
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'gentle', label: 'Gentle (50%)', desc: 'Mild baseline tension' },
            { id: 'moderate', label: 'Moderate (85%)', desc: 'Standard clinical baseline' },
            { id: 'firm', label: 'Firm (125%)', desc: 'Active strength recruit' },
            { id: 'intensive', label: 'Intensive (160%)', desc: 'Endurance threshold' }
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => setResistanceLevel(lvl.id as any)}
              className={`p-3 rounded-lg border text-left cursor-pointer transition-all ${
                resistanceLevel === lvl.id 
                  ? 'bg-primary-container text-white border-primary-container shadow-sm' 
                  : 'bg-white text-on-surface border-outline-variant hover:bg-surface-container-low'
              }`}
            >
              <p className="text-sm font-bold">{lvl.label}</p>
              <p className={`text-[10px] mt-0.5 ${resistanceLevel === lvl.id ? 'opacity-90' : 'text-on-surface-variant'}`}>
                {lvl.desc}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Active gameplay module simulation overlay block */}
      {selectedExercise && (
        <section className="border-2 border-primary-container rounded-2xl overflow-hidden shadow-lg scroll-mt-20 block animate-bounce-subtle" id="active-session-block">
          <div className="p-1 px-4 bg-primary text-white text-xs font-bold uppercase tracking-widest flex justify-between items-center">
            <span>ACTIVE TRAINING SIMULATOR</span>
            <span className="animate-pulse">● Device connected</span>
          </div>
          <DailySessionSimulator 
            exercise={selectedExercise} 
            onSessionComplete={handleCompleteSession}
            onClose={() => setSelectedExercise(null)}
          />
        </section>
      )}

      {/* SUCCESS POPUP BANNER */}
      {sessionCompletedNotice && (
        <section id="completion-feedback-banner" className="bg-emerald-55 text-emerald-950 p-6 rounded-xl border-2 border-emerald-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex gap-3">
            <CheckCircle2 size={32} className="text-secondary shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-lg">Therapeutic Record Saved!</p>
              <p className="text-sm opacity-90 leading-normal max-w-[500px]">
                You completed **{sessionCompletedNotice.repsDone} reps** of **{sessionCompletedNotice.exerciseName}** in **{Math.round(sessionCompletedNotice.durationSec / 60)}m {sessionCompletedNotice.durationSec % 60}s**. Peak grip load registered **{sessionCompletedNotice.maxForceKg} kg**.
              </p>
              <p className="text-xs mt-2 italic font-semibold text-secondary">
                Clinical feedback: &quot;{sessionCompletedNotice.notes}&quot;
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSessionCompletedNotice(null)} 
            className="px-4 py-2 bg-secondary text-white font-bold rounded-lg text-sm hover:opacity-90 self-end md:self-center transition-opacity"
          >
            Acknowledge Log
          </button>
        </section>
      )}

      {/* Grid of prescriptive workout programs */}
      <section className="grid grid-cols-1 gap-4">
        {exercises.map((ex) => {
          const currentAdjustedGoalKg = getSimulatedTargetKg(ex.avgGoalKg);

          return (
            <div 
              key={ex.id}
              className={`card-surface p-6 rounded-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all hover:scale-[1.002] hover:shadow-sm ${
                selectedExercise?.id === ex.id ? 'border-primary bg-primary/5' : 'border-outline-variant bg-white'
              }`}
            >
              <div className="flex items-start gap-4 text-left">
                {/* Visual Icon holder */}
                <div className={`p-4 rounded-xl shrink-0 ${
                  ex.id === 'power-squeeze' ? 'bg-primary/10 text-primary' :
                  ex.id === 'interval-hold' ? 'bg-emerald-100 text-emerald-800' :
                  ex.id === 'reflex-trigger' ? 'bg-amber-100 text-amber-800' : 'bg-purple-150 text-purple-700'
                }`}>
                  {renderExerciseIcon(ex.icon)}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-lg text-on-surface leading-tight">{ex.name}</h3>
                    <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-surface-container-highest text-on-surface-variant font-sans">
                      Goal: {currentAdjustedGoalKg} kg
                    </span>
                  </div>
                  <p className="text-[14px] leading-relaxed text-on-surface-variant max-w-[500px]">
                    {ex.description}
                  </p>
                </div>
              </div>

              {/* Action columns */}
              <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-4 md:pt-0 border-surface-container-highest">
                <div className="text-left md:text-right">
                  <p className="text-xs text-on-surface-variant font-sans">Target Reps</p>
                  <p className="text-lg font-extrabold text-on-surface">{ex.targetReps} reps</p>
                </div>
                
                <button
                  id={`btn-launch-ex-${ex.id}`}
                  onClick={() => handleStartExercise(ex)}
                  className="px-5 py-3 bg-primary text-on-primary hover:bg-primary-container font-bold rounded-xl flex items-center gap-2 active:scale-95 transition-all text-sm cursor-pointer shadow-sm"
                >
                  <Play size={14} fill="currentColor" />
                  Start Exercise
                </button>
              </div>

            </div>
          );
        })}
      </section>

      {/* Safety Clinical Notice */}
      <section className="bg-amber-50 text-amber-950 p-4 rounded-xl border border-amber-300/40 flex items-start gap-3">
        <ShieldAlert size={20} className="text-amber-800 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-xs uppercase tracking-wide tracking-wider block text-amber-800">
            Emergency Medical Safeguards
          </span>
          <p className="text-xs leading-normal mt-1 opacity-90 max-w-[650px]">
            If you experience sharp localized pain, spastic cramping or dizziness, pause immediately and relax your arm. Never exceed comfort levels; coordination and consistency represent your principal therapeutic milestones.
          </p>
        </div>
      </section>

    </div>
  );
}
