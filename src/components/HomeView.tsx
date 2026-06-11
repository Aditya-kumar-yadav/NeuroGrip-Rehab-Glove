import React from 'react';
import { 
  TrendingUp, 
  Play, 
  Info, 
  Dumbbell, 
  Calendar, 
  Timer, 
  Award,
  ChevronRight,
  Brain
} from 'lucide-react';
import { PatientProfile, SessionLog } from '../types';

interface HomeViewProps {
  profile: PatientProfile;
  todayReps: number;
  todayMinutes: number;
  avgGripStrength: number;
  weeklyRepsData: { day: string; reps: number; isToday?: boolean; dateString: string }[];
  onStartSessionClick: () => void;
  onNavigateToExercises: () => void;
  onNavigateToMonitor: () => void;
}

export default function HomeView({
  profile,
  todayReps,
  todayMinutes,
  avgGripStrength,
  weeklyRepsData,
  onStartSessionClick,
  onNavigateToExercises,
  onNavigateToMonitor
}: HomeViewProps) {
  
  // Custom Brain SVG for "Your Journey" box to match the clean medical aesthetic of the mockup
  const BrainIllustrationSvg = () => (
    <svg 
      viewBox="0 0 200 200" 
      className="w-40 h-40 text-on-surface-variant opacity-15"
      fill="none" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      {/* Left Hemisphere */}
      <path d="M100,25 C75,25 45,35 45,75 C45,100 65,115 55,135 C45,150 55,175 75,175 C85,175 90,165 100,165" />
      <path d="M45,75 C30,85 25,105 35,120 C40,128 50,132 55,135" />
      <path d="M65,115 C55,100 55,85 65,75" />
      <path d="M75,175 C70,145 80,135 100,135" />
      {/* Right Hemisphere */}
      <path d="M100,25 C125,25 155,35 155,75 C155,100 135,115 145,135 C155,150 145,175 125,175 C115,175 110,165 100,165" />
      <path d="M155,75 C170,85 175,105 165,120 C160,128 150,132 145,135" />
      <path d="M135,115 C145,100 145,85 135,75" />
      <path d="M125,175 C130,145 120,135 100,135" />
      {/* Neural Pathways Center lines */}
      <line x1="100" y1="25" x2="100" y2="165" strokeWidth="4" strokeDasharray="5,5" />
    </svg>
  );

  return (
    <div id="home-view-container" className="space-y-10 animate-fade-in">
      
      {/* Greeting & Progress Header */}
      <section id="header-section" className="mb-8">
        <div className="flex flex-col gap-1 text-left">
          <h2 id="patient-greeting" className="font-sans text-[28px] leading-tight font-bold text-on-surface">
            Hello, {profile.name.split(' ')[0]}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <div 
              id="recovery-trend-pill" 
              className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full flex items-center gap-1.5"
            >
              <TrendingUp size={16} className="text-on-secondary-container" />
              <span className="text-[14px] font-bold font-sans">85% Recovery Trend</span>
            </div>
            <span id="encouraging-phrase" className="text-[16px] text-on-surface-variant font-medium">Keep it up!</span>
          </div>
        </div>
      </section>

      {/* Primary Action Hero Card */}
      <section id="hero-action-section">
        <button
          id="btn-start-daily-session"
          onClick={onStartSessionClick}
          className="w-full py-8 px-6 bg-primary text-on-primary rounded-xl flex flex-col items-center justify-center gap-4 shadow-md hover:bg-primary-container active:scale-[0.98] transition-all cursor-pointer text-center group"
        >
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
            <Play size={36} fill="white" className="text-white ml-1" />
          </div>
          <span className="text-[22px] md:text-2xl font-bold tracking-tight">Start Daily Session</span>
        </button>
      </section>

      {/* Daily Stats Bento Grid */}
      <section id="daily-stats-section">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant font-sans">
            DAILY STATS
          </h3>
          <button 
            id="pt-info-button"
            onClick={onNavigateToMonitor} 
            className="p-1 hover:bg-surface-container rounded-full text-on-surface-variant transition-colors"
            title="View Details"
          >
            <Info size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Grip Strength */}
          <div 
            id="stat-grip-strength" 
            onClick={onNavigateToMonitor}
            className="card-surface p-6 rounded-xl flex flex-col gap-2 hover:border-primary/40 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-primary">
              <Dumbbell size={20} />
              <span className="text-[15px] font-bold tracking-wide">Grip Strength</span>
            </div>
            <div className="mt-2 text-left">
              <span className="text-4xl font-black leading-none text-on-surface">
                {avgGripStrength > 0 ? avgGripStrength : 12}
              </span>
              <span className="text-[15px] font-bold text-on-surface-variant ml-1">kg</span>
            </div>
            {/* Calibration standard progress bar representation */}
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round(((avgGripStrength || 12) / profile.baselineStrengthKg) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-on-surface-variant text-left mt-0.5">
              Target baseline: {profile.baselineStrengthKg}kg
            </span>
          </div>

          {/* Reps Done */}
          <div 
            id="stat-reps-done" 
            onClick={onNavigateToExercises}
            className="card-surface p-6 rounded-xl flex flex-col gap-2 hover:border-secondary/40 cursor-pointer"
          >
            <div className="flex items-center gap-2 text-secondary">
              <Calendar size={20} />
              <span className="text-[15px] font-bold tracking-wide">Reps Done</span>
            </div>
            <div className="mt-2 text-left">
              <span className="text-4xl font-black leading-none text-secondary">
                {todayReps}
              </span>
              <span className="text-[15px] text-on-surface-variant ml-1">/{profile.repsTargetDaily}</span>
            </div>
            {/* Progress representation */}
            <div className="h-1.5 w-full bg-surface-container-highest rounded-full mt-3 overflow-hidden">
              <div 
                className="h-full bg-secondary rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.round((todayReps / profile.repsTargetDaily) * 100))}%` }}
              />
            </div>
            <span className="text-[11px] text-on-surface-variant text-left mt-0.5">
              Daily quota: {Math.round((todayReps / profile.repsTargetDaily) * 100)}% complete
            </span>
          </div>

          {/* Session Time */}
          <div 
            id="stat-session-time" 
            onClick={onNavigateToMonitor}
            className="card-surface p-6 rounded-xl flex flex-col gap-2 hover:border-amber-700/40 cursor-pointer text-left"
          >
            <div className="flex items-center gap-2 text-amber-700">
              <Timer size={20} />
              <span className="text-[15px] font-bold tracking-wide">Session Time</span>
            </div>
            <div className="mt-2">
              <span className="text-4xl font-black leading-none text-on-surface">
                {todayMinutes}
              </span>
              <span className="text-[15px] text-on-surface-variant ml-1">min</span>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md mt-4 inline-block w-fit">
              {todayMinutes >= profile.timeTargetDailyMin ? 'Daily target met ✓' : `${profile.timeTargetDailyMin - todayMinutes} min to goal`}
            </span>
          </div>

        </div>
      </section>

      {/* Interactive Weekly Activity Chart */}
      <section id="weekly-activity-section">
        <h3 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-4 tracking-widest text-left">
          WEEKLY ACTIVITY
        </h3>
        
        <div className="card-surface p-6 rounded-xl">
          <div className="flex items-end justify-between h-36 gap-2 pt-6">
            {weeklyRepsData.map((data, index) => {
              // Standard scaling calculation for bar height proportion
              const maxRepsInWeek = Math.max(...weeklyRepsData.map(d => d.reps), 50);
              const heightPercentage = Math.max(8, Math.min(95, Math.round((data.reps / maxRepsInWeek) * 100)));
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 gap-2 group relative">
                  
                  {/* Tooltip on Hover */}
                  <div className="absolute bottom-full mb-2 bg-on-surface text-surface text-xs py-1.5 px-2.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20 whitespace-nowrap">
                    <p className="font-bold">{data.dateString}</p>
                    <p className="text-primary-fixed">{data.reps} repetitions</p>
                  </div>

                  {/* Highlight "TODAY" pill badge above active bar */}
                  {data.isToday && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-on-surface text-surface text-[10px] font-bold px-2 py-0.5 rounded tracking-wide z-10">
                      TODAY
                    </div>
                  )}

                  {/* Active graphical bar segment */}
                  <div className="w-full bg-surface-container-highest rounded-t-lg relative overflow-hidden h-28 flex items-end">
                    <div 
                      className={`w-full rounded-t-lg transition-all duration-700 origin-bottom ${
                        data.isToday 
                          ? 'bg-primary-container' 
                          : data.reps > 0 
                          ? 'bg-primary-container/40 group-hover:bg-primary-container/70' 
                          : 'bg-surface-container-highest'
                      }`}
                      style={{ height: `${heightPercentage}%` }}
                    />
                  </div>

                  {/* Weekday label character */}
                  <span className={`text-[13px] font-bold ${data.isToday ? 'text-primary font-black scale-105' : 'text-on-surface-variant'}`}>
                    {data.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Decorative Encouragement Card with brain graphic */}
      <section id="journey-accomplishment-section">
        <div className="relative overflow-hidden rounded-xl bg-surface-container flex items-center px-8 py-6 border border-outline-variant text-left">
          <div className="z-10 max-w-[65%]">
            <h4 className="text-[20px] font-bold text-primary mb-1">Your Journey</h4>
            <p className="text-[15px] leading-relaxed text-on-surface-variant font-sans">
              Every squeeze builds a stronger neural pathway. Consistency is your clinical superpower.
            </p>
          </div>
          {/* Aligned exactly with the brain background from mock layout */}
          <div className="absolute right-[-10px] bottom-[-20px]">
            <BrainIllustrationSvg />
          </div>
        </div>
      </section>

    </div>
  );
}
