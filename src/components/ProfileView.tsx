import React, { useState } from 'react';
import { 
  User, 
  Settings2, 
  Flame, 
  MessageSquare, 
  Heart, 
  Sliders, 
  Bell, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { PatientProfile } from '../types';
import { PT_PRESCRIPTIONS } from '../mockData';

interface ProfileViewProps {
  profile: PatientProfile;
  audioFeedback: boolean;
  onUpdateProfile: (updated: PatientProfile) => void;
  onToggleAudio: (state: boolean) => void;
}

export default function ProfileView({ 
  profile, 
  audioFeedback,
  onUpdateProfile,
  onToggleAudio 
}: ProfileViewProps) {
  const [name, setName] = useState<string>(profile.name);
  const [repsGoal, setRepsGoal] = useState<number>(profile.repsTargetDaily);
  const [minutesGoal, setMinutesGoal] = useState<number>(profile.timeTargetDailyMin);
  const [affectedSide, setAffectedSide] = useState<'Left' | 'Right' | 'Bilateral'>(profile.handicappedSide);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveProfile = () => {
    const updated: PatientProfile = {
      ...profile,
      name,
      repsTargetDaily: repsGoal,
      timeTargetDailyMin: minutesGoal,
      handicappedSide: affectedSide,
    };
    onUpdateProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div id="profile-view-container" className="space-y-8 animate-fade-in text-left">
      
      {/* Page header */}
      <section>
        <h2 className="text-2xl font-bold text-on-surface">Patient Profile</h2>
        <p className="text-on-surface-variant text-base mt-1">
          Review diagnostic parameters, adjust daily training targets, and manage accessible therapist interactions.
        </p>
      </section>

      {/* Primary Clinical Diagnosis card */}
      <section className="card-surface p-6 rounded-xl bg-white border border-outline-variant relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-2 bg-primary" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-primary-fixed rounded-full flex items-center justify-center shrink-0 border border-outline-variant">
              <User size={28} className="text-primary" />
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h3 className="font-extrabold text-xl text-on-surface leading-snug">{profile.name}</h3>
                <span className="px-2 py-0.5 text-xs font-bold roundedbg bg-primary-container text-white rounded">
                  Age {profile.age}
                </span>
              </div>
              <p className="text-sm font-bold text-primary">{profile.diagnosis}</p>
              <p className="text-xs text-on-surface-variant">
                Severity: <strong className="text-rose-800">{profile.severity}</strong> | Affected quadrant: <strong className="text-primary">{profile.handicappedSide}-sided hemiparesis</strong>
              </p>
            </div>
          </div>
          
          <div className="bg-surface-container p-4 rounded-lg md:text-right border border-outline-variant/60">
            <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider block">Clinical Care Supervisor</span>
            <span className="font-extrabold text-sm block text-on-surface mt-1">{profile.therapistName}</span>
            <span className="text-xs text-secondary font-bold block mt-0.5">Physical Therapy (PT, DPT)</span>
          </div>
        </div>
      </section>

      {/* Target setting selectors */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Targets adjuster form */}
        <div className="card-surface p-6 rounded-xl bg-white border border-outline-variant space-y-5">
          <div className="flex items-center gap-2 text-primary pb-3 border-b border-surface-container">
            <Sliders size={20} />
            <h4 className="font-bold text-base">Adjust Daily Goals</h4>
          </div>

          {/* Name change block */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Patient Name</label>
            <input 
              id="patient-name-field"
              type="text" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 border-2 border-outline rounded-lg text-sm font-bold text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          {/* Hemiplegic affected arm selectivity */}
          <div className="space-y-1.5 text-left">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-wider block">Affected Hemiparesis Arm</label>
            <div className="grid grid-cols-3 gap-2 mt-1">
              {(['Left', 'Right', 'Bilateral'] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => setAffectedSide(side)}
                  className={`py-2 text-xs font-bold border rounded-lg cursor-pointer transition-all ${
                    affectedSide === side 
                      ? 'bg-primary-container text-white border-primary-container shadow-sm' 
                      : 'bg-white text-on-surface border-outline-variant hover:bg-surface-container-low'
                  }`}
                >
                  {side} Side
                </button>
              ))}
            </div>
          </div>

          {/* Repetitions target slider */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <span>Daily Squeezes Target</span>
              <span className="text-secondary font-extrabold">{repsGoal} repetitions</span>
            </div>
            <input
              id="reps-target-slider"
              type="range"
              min="10"
              max="100"
              step="5"
              value={repsGoal}
              onChange={(e) => setRepsGoal(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
            />
          </div>

          {/* Workout minutes target slider */}
          <div className="space-y-2 text-left">
            <div className="flex justify-between items-center text-xs font-bold text-on-surface-variant uppercase tracking-wider">
              <span>Therapy Time Target</span>
              <span className="text-primary font-extrabold">{minutesGoal} minutes</span>
            </div>
            <input
              id="time-target-slider"
              type="range"
              min="5"
              max="45"
              step="5"
              value={minutesGoal}
              onChange={(e) => setMinutesGoal(parseInt(e.target.value))}
              className="w-full h-2 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary"
            />
          </div>

          <div className="pt-2">
            <button
              id="save-profile-btn"
              onClick={handleSaveProfile}
              className="w-full py-3 bg-primary text-on-primary font-bold rounded-lg hover:opacity-95 active:scale-95 transition-all text-sm cursor-pointer shadow-sm text-center"
            >
              Save Target Preferences
            </button>
          </div>

          {savedSuccess && (
            <div className="bg-emerald-50 text-emerald-900 border border-emerald-250 text-xs p-2.5 rounded-md flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-secondary shrink-0" />
              Settings updated successfully! Targets are active on the dashboard.
            </div>
          )}
        </div>

        {/* Clinical preferences block */}
        <div className="space-y-6">
          
          <div className="card-surface p-6 rounded-xl bg-white border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-primary pb-3 border-b border-surface-container">
              <Settings2 size={20} />
              <h4 className="font-bold text-base">Accessible Biofeedback</h4>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Enable targeted audio oscillators and acoustic prompts to align contracting routines with visual rhythms. Excellent for patients with sensory loss.
            </p>

            <div className="flex items-center justify-between p-3 bg-surface-container rounded-lg border border-outline-variant/60">
              <div className="text-left">
                <span className="font-bold text-xs uppercase tracking-wide block text-on-surface">Acoustic Tone Oscillators</span>
                <span className="text-[11px] text-on-surface-variant">Plays soft sine-wave audio frequency feedback</span>
              </div>
              
              <button
                id="audio-feedback-toggle"
                onClick={() => onToggleAudio(!audioFeedback)}
                className={`w-12 h-6 rounded-full p-1 transition-colors focus:ring-2 focus:ring-primary focus:outline-none cursor-pointer ${
                  audioFeedback ? 'bg-secondary' : 'bg-outline-variant'
                }`}
                title="Toggle Audio Oscillators"
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                  audioFeedback ? 'translate-x-6' : 'translate-x-0'
                }`} />
              </button>
            </div>
          </div>

          {/* Clinician comments lists */}
          <div className="card-surface p-6 rounded-xl bg-white border border-outline-variant space-y-4">
            <div className="flex items-center gap-2 text-amber-700 pb-3 border-b border-surface-container">
              <MessageSquare size={20} />
              <h4 className="font-bold text-base">Physiotherapist Prescriptions</h4>
            </div>

            <div className="space-y-4 max-h-[190px] overflow-y-auto pr-1">
              {PT_PRESCRIPTIONS.map((pr) => (
                <div key={pr.id} className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-left">
                  <div className="flex justify-between items-center text-[10px] font-bold text-amber-900 border-b border-amber-250 pb-1 mb-1.5">
                    <span>{pr.author}</span>
                    <span>{pr.date}</span>
                  </div>
                  <p className="text-xs text-on-surface font-sans leading-relaxed">
                    &quot;{pr.text}&quot;
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </section>

    </div>
  );
}
