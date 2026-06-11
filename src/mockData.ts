import { Exercise, SessionLog, PatientProfile } from './types';

export const DEFAULT_PROFILE: PatientProfile = {
  name: 'Alex Mercer',
  age: 68,
  diagnosis: 'Ischemic Stroke affecting Left Hemisphere (Right-sided hemiparesis)',
  severity: 'Moderate',
  handicappedSide: 'Right',
  therapistName: 'Dr. Evelyn Ramirez, PT, DPT',
  baselineStrengthKg: 20,
  repsTargetDaily: 50,
  timeTargetDailyMin: 15,
};

export const CLINICAL_EXERCISES: Exercise[] = [
  {
    id: 'power-squeeze',
    name: 'Power Squeeze',
    icon: 'dumbbell',
    colorClass: 'text-primary',
    badgeClass: 'bg-primary/10 text-primary',
    description: 'Squeeze with maximum continuous effort to rebuild neural pathways and recruit dormant muscle fibers.',
    instructions: [
      'Sit comfortably with your elbow resting at a 90-degree angle on a flat surface.',
      'Hold the grip device securely without tension in your shoulder.',
      'Squeeze the controller as hard as you comfortably can for 3 seconds, then release.',
      'Repeat for the specified number of repetitions.'
    ],
    targetReps: 15,
    avgGoalKg: 14,
    type: 'squeeze'
  },
  {
    id: 'interval-hold',
    name: 'Squeeze & Steady Hold',
    icon: 'timer',
    colorClass: 'text-emerald-700',
    badgeClass: 'bg-emerald-50 text-emerald-800',
    description: 'Squeeze to a calibrated target pressure and hold it steadily to reduce tremors and build muscle endurance.',
    instructions: [
      'Grip the device and prepare for static contraction.',
      'Squeeze until you reach the blue target zone (approx. 10kg).',
      'Hold the force meter within the target zone steadily for 5 full seconds.',
      'Release slowly to support deceleration control, then rest.'
    ],
    targetReps: 10,
    avgGoalKg: 10,
    type: 'hold'
  },
  {
    id: 'reflex-trigger',
    name: 'Reflex Squeeze Trigger',
    icon: 'zap',
    colorClass: 'text-amber-700',
    badgeClass: 'bg-amber-50 text-amber-800',
    description: 'Develop rapid reaction times by squeezing instantly when the visual target cue lights up.',
    instructions: [
      'Keep your hand relaxed on the grip device with light contact.',
      'Focus strictly on the screen signal indicator.',
      'The moment the signal turns Green, squeeze as fast as possible.',
      'Release immediately after reaching the peak threshold.'
    ],
    targetReps: 15,
    avgGoalKg: 12,
    type: 'reaction'
  },
  {
    id: 'precision-pinch',
    name: 'Precision Fine Pinch',
    icon: 'target',
    colorClass: 'text-purple-700',
    badgeClass: 'bg-purple-100 text-purple-800',
    description: 'Develop coordinate precision between thumb and individual finger pads, vital for fine daily tasks.',
    instructions: [
      'Pinch the dynamic target between your thumb and index/middle fingers.',
      'Gradually increase force strictly matching the sliding target bar wave.',
      'Follow the sine-wave intensity up and down smoothly.',
      'Helps restore fine control for handling coins, pencils, and utensils.'
    ],
    targetReps: 10,
    avgGoalKg: 6,
    type: 'precision'
  }
];

export const MOCK_HISTORY_LOGS: SessionLog[] = [
  {
    id: 'log-1',
    date: '2026-06-08', // Monday
    exerciseId: 'power-squeeze',
    exerciseName: 'Power Squeeze',
    repsDone: 25,
    targetReps: 15,
    durationSec: 320,
    avgForceKg: 11.2,
    maxForceKg: 14.5,
    tremorIndex: 4,
    notes: 'Slight tremor noticed at maximum efforts, but strong commitment.',
    successRate: 80,
  },
  {
    id: 'log-2',
    date: '2026-06-09', // Tuesday
    exerciseId: 'interval-hold',
    exerciseName: 'Squeeze & Steady Hold',
    repsDone: 40,
    targetReps: 15,
    durationSec: 480,
    avgForceKg: 9.8,
    maxForceKg: 11.0,
    tremorIndex: 3,
    notes: 'Steadiness is improving slightly on hold intervals.',
    successRate: 85,
  },
  {
    id: 'log-3',
    date: '2026-06-10', // Wednesday
    exerciseId: 'precision-pinch',
    exerciseName: 'Precision Fine Pinch',
    repsDone: 32,
    targetReps: 20,
    durationSec: 380,
    avgForceKg: 5.4,
    maxForceKg: 6.8,
    tremorIndex: 5,
    notes: 'Good execution, but index finger fatigues quickly.',
    successRate: 75,
  },
  // Today's stats: Alex reached 45 repetitions in total today, session duration 15 minutes.
  // We can model this by adding the current sessions for today!
  {
    id: 'log-4',
    date: '2026-06-11', // Thursday (TODAY)
    exerciseId: 'power-squeeze',
    exerciseName: 'Power Squeeze',
    repsDone: 25,
    targetReps: 25,
    durationSec: 420,
    avgForceKg: 12.0,
    maxForceKg: 15.2,
    tremorIndex: 2,
    notes: 'Excellent output! Peak force reached a record 15.2 kg.',
    successRate: 90,
  },
  {
    id: 'log-5',
    date: '2026-06-11', // Thursday (TODAY second session)
    exerciseId: 'interval-hold',
    exerciseName: 'Squeeze & Steady Hold',
    repsDone: 20,
    targetReps: 25,
    durationSec: 480,
    avgForceKg: 10.1,
    maxForceKg: 11.5,
    tremorIndex: 3,
    notes: 'Maintained fine-tuned force output with high accuracy.',
    successRate: 92,
  }
];

export const PT_PRESCRIPTIONS = [
  {
    id: 'note-1',
    date: 'Jun 08, 2026',
    author: 'Dr. Evelyn Ramirez, PT, DPT',
    text: 'Alex, concentrate on the relaxation phase of each squeeze. Rest for at least 4 seconds between repetitions to prevent spastic contraction build-up.'
  },
  {
    id: 'note-2',
    date: 'Jun 05, 2026',
    author: 'Dr. Evelyn Ramirez, PT, DPT',
    text: 'Excellent work on the precision pinch! Let us aim for a consistent daily target of 50 repetitions total across all three exercise regimes this week.'
  }
];
