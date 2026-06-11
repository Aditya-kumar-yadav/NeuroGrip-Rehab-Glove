export interface Exercise {
  id: string;
  name: string;
  icon: string;
  colorClass: string;
  badgeClass: string;
  description: string;
  instructions: string[];
  targetReps: number;
  avgGoalKg: number;
  type: 'squeeze' | 'hold' | 'reaction' | 'precision';
}

export interface SessionLog {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  repsDone: number;
  targetReps: number;
  durationSec: number;
  avgForceKg: number;
  maxForceKg: number;
  tremorIndex: number; // 0 to 10 (higher means more unstable)
  notes: string;
  successRate: number; // calculated % of perfect target squeeze holds
}

export interface PatientProfile {
  name: string;
  age: number;
  diagnosis: string;
  severity: string; // 'Mild' | 'Moderate' | 'Severe'
  handicappedSide: 'Left' | 'Right' | 'Bilateral';
  therapistName: string;
  baselineStrengthKg: number;
  repsTargetDaily: number;
  timeTargetDailyMin: number;
}
