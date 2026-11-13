import type { Goal } from '@/features/onboarding/store';

export type Intensity = 'low' | 'moderate' | 'high';
export type WorkoutCategory = 'strength' | 'cardio' | 'mobility' | 'mindfulness';

export interface Exercise {
  id: string;
  name: string;
  /** Seconds for timed, or reps for counted exercises. */
  seconds?: number;
  reps?: number;
  cue: string;
}

export interface Workout {
  id: string;
  title: string;
  category: WorkoutCategory;
  intensity: Intensity;
  durationMin: number;
  kcal: number;
  equipment: 'none' | 'dumbbells' | 'mat';
  goals: Goal[];
  summary: string;
  exercises: Exercise[];
}

const timed = (id: string, name: string, seconds: number, cue: string): Exercise => ({
  id,
  name,
  seconds,
  cue,
});
const reps = (id: string, name: string, n: number, cue: string): Exercise => ({
  id,
  name,
  reps: n,
  cue,
});

export const WORKOUTS: Workout[] = [
  {
    id: 'quick_core_10',
    title: '10-min Core Reset',
    category: 'strength',
    intensity: 'moderate',
    durationMin: 10,
    kcal: 80,
    equipment: 'mat',
    goals: ['build_muscle', 'stay_active', 'lose_weight'],
    summary: 'Five core moves, no equipment. Great between meetings.',
    exercises: [
      timed('plank', 'Forearm plank', 40, 'Squeeze glutes, keep hips level.'),
      timed('deadbug', 'Dead bug', 45, 'Press lower back into the mat.'),
      timed('side_l', 'Side plank (left)', 30, 'Stack feet, lift hips high.'),
      timed('side_r', 'Side plank (right)', 30, 'Drive the floor away.'),
      reps('bicycle', 'Bicycle crunch', 20, 'Slow and controlled; opposite elbow to knee.'),
      timed('hollow', 'Hollow hold', 30, 'Ribs down, arms by ears if you can.'),
    ],
  },
  {
    id: 'full_body_20',
    title: '20-min Full Body Strength',
    category: 'strength',
    intensity: 'high',
    durationMin: 20,
    kcal: 190,
    equipment: 'dumbbells',
    goals: ['build_muscle', 'lose_weight'],
    summary: 'Compound movements in a circuit. Pick a weight you can control.',
    exercises: [
      reps('squat', 'Goblet squat', 12, 'Elbows inside knees at the bottom.'),
      reps('row', 'Bent-over row', 12, 'Pull to the hips, not the chest.'),
      reps('press', 'Overhead press', 10, 'Brace your core; avoid arching.'),
      reps('rdl', 'Romanian deadlift', 12, 'Hinge at the hips, soft knees.'),
      reps('pushup', 'Push-up', 10, 'Body in one line; elbows at 45°.'),
      timed('rest', 'Rest', 60, 'Shake it out. Repeat the circuit twice.'),
    ],
  },
  {
    id: 'walk_30',
    title: '30-min Brisk Walk',
    category: 'cardio',
    intensity: 'low',
    durationMin: 30,
    kcal: 140,
    equipment: 'none',
    goals: ['stay_active', 'lose_weight', 'reduce_stress'],
    summary: 'Zone 2 walk outdoors. Aim for a pace where you can still talk.',
    exercises: [
      timed('warm', 'Easy pace', 300, 'Loosen up; relax your shoulders.'),
      timed('brisk', 'Brisk pace', 1200, 'Swing your arms; quick, light steps.'),
      timed('cool', 'Cool down', 300, 'Slow down gradually and breathe deep.'),
    ],
  },
  {
    id: 'hiit_15',
    title: '15-min HIIT Burner',
    category: 'cardio',
    intensity: 'high',
    durationMin: 15,
    kcal: 180,
    equipment: 'none',
    goals: ['lose_weight', 'run_further'],
    summary: '40 seconds on, 20 off. Scale every move to your level.',
    exercises: [
      timed('jacks', 'Jumping jacks', 40, 'Land softly on the balls of your feet.'),
      timed('rest1', 'Rest', 20, 'Breathe.'),
      timed('climbers', 'Mountain climbers', 40, 'Hips low, drive knees fast.'),
      timed('rest2', 'Rest', 20, 'Breathe.'),
      timed('squatj', 'Squat jumps', 40, 'Or air squats for low impact.'),
      timed('rest3', 'Rest', 20, 'Breathe.'),
      timed('burpee', 'Burpees', 40, 'Step back instead of jumping if needed.'),
      timed('rest4', 'Rest', 20, 'Repeat 3 rounds.'),
    ],
  },
  {
    id: 'mobility_12',
    title: '12-min Morning Mobility',
    category: 'mobility',
    intensity: 'low',
    durationMin: 12,
    kcal: 45,
    equipment: 'mat',
    goals: ['sleep_better', 'reduce_stress', 'stay_active'],
    summary: 'Open the hips and thoracic spine before your day starts.',
    exercises: [
      timed('catcow', 'Cat-cow', 60, 'Move with your breath.'),
      timed('wgs', "World's greatest stretch", 90, 'Rotate toward the front leg.'),
      timed('pigeon', 'Pigeon (each side)', 120, 'Keep hips square.'),
      timed('tspine', 'Thoracic rotations', 60, 'Follow your hand with your eyes.'),
      timed('hang', 'Forward fold', 60, 'Let your head hang heavy.'),
    ],
  },
  {
    id: 'breath_5',
    title: '5-min Box Breathing',
    category: 'mindfulness',
    intensity: 'low',
    durationMin: 5,
    kcal: 10,
    equipment: 'none',
    goals: ['reduce_stress', 'sleep_better'],
    summary: 'Four counts in, hold, out, hold. Downshift your nervous system.',
    exercises: [
      timed('settle', 'Settle in', 30, 'Sit tall, close your eyes or soften your gaze.'),
      timed('box', 'Box breathing', 240, 'In 4 · hold 4 · out 4 · hold 4.'),
      timed('notice', 'Notice', 30, 'How does your body feel now?'),
    ],
  },
  {
    id: 'run_intervals_25',
    title: '25-min Run Intervals',
    category: 'cardio',
    intensity: 'high',
    durationMin: 25,
    kcal: 260,
    equipment: 'none',
    goals: ['run_further', 'lose_weight'],
    summary: 'Build speed endurance with 1-minute pushes.',
    exercises: [
      timed('warmup', 'Warm-up jog', 300, 'Easy; find your rhythm.'),
      timed('push1', 'Push', 60, 'Comfortably hard.'),
      timed('float1', 'Float', 120, 'Recover at an easy jog.'),
      timed('push2', 'Push', 60, 'Tall posture, quick cadence.'),
      timed('float2', 'Float', 120, 'Recover.'),
      timed('push3', 'Push', 60, 'Last hard effort.'),
      timed('cooldown', 'Cool-down', 300, 'Walk/jog it out.'),
    ],
  },
  {
    id: 'lower_body_18',
    title: '18-min Lower Body',
    category: 'strength',
    intensity: 'moderate',
    durationMin: 18,
    kcal: 150,
    equipment: 'none',
    goals: ['build_muscle', 'run_further', 'stay_active'],
    summary: 'Glutes, quads and calves with bodyweight only.',
    exercises: [
      reps('lunge', 'Reverse lunge (each leg)', 12, 'Knee tracks over the toes.'),
      reps('bridge', 'Glute bridge', 15, 'Pause and squeeze at the top.'),
      reps('wall', 'Wall sit', 45, 'Thighs parallel; breathe.'),
      reps('calf', 'Calf raise', 20, 'Full range; slow on the way down.'),
      reps('splitsq', 'Split squat (each leg)', 10, 'Front shin vertical.'),
    ],
  },
];

export function workoutById(id: string): Workout | undefined {
  return WORKOUTS.find((w) => w.id === id);
}

/** Simple content-based recommendation: match goals, prefer shorter sessions late in the day. */
export function recommendWorkouts(
  goals: Goal[],
  hour = new Date().getHours(),
  limit = 3,
): Workout[] {
  const score = (w: Workout) => {
    let s = w.goals.filter((g) => goals.includes(g)).length * 10;
    if (hour >= 20 && w.intensity === 'high') s -= 8;
    if (hour >= 20 && (w.category === 'mindfulness' || w.category === 'mobility')) s += 5;
    if (hour < 9 && w.category === 'mobility') s += 4;
    s -= w.durationMin / 10;
    return s;
  };
  return [...WORKOUTS].sort((a, b) => score(b) - score(a)).slice(0, limit);
}
