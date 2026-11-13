export type CoachRole = 'user' | 'assistant';

export interface CoachAction {
  type: 'start_workout' | 'log_water' | 'open_insights';
  label: string;
  workoutId?: string;
  amountMl?: number;
}

export interface CoachMessage {
  id: string;
  role: CoachRole;
  text: string;
  at: number;
  streaming?: boolean;
  error?: boolean;
  /** Source of the reply: live model, or on-device fallback when no server is configured. */
  source?: 'model' | 'fallback';
  actions?: CoachAction[];
}

/** Snapshot of user state sent with each request so the coach is contextual. */
export interface CoachContext {
  name: string;
  goals: string[];
  units: 'metric' | 'imperial';
  daysPerWeek: number;
  today: {
    steps: number;
    stepsGoal: number;
    activeMinutes: number;
    activeMinutesGoal: number;
    waterMl: number;
    waterGoal: number;
    kcalEaten: number;
    kcalGoal: number;
    sleepHours: number;
  };
  streakDays: number;
  localHour: number;
  availableWorkouts: {
    id: string;
    title: string;
    durationMin: number;
    intensity: string;
    category: string;
  }[];
}
