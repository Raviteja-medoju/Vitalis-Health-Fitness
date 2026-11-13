/**
 * Typed event taxonomy. Every product event is declared here so that
 * designers, PMs and engineers share one vocabulary (object_action naming).
 * Funnels (onboarding, workout) are derived from these events in the warehouse / Hotjar / PostHog.
 */

export type OnboardingStep = 'welcome' | 'goals' | 'about_you' | 'schedule' | 'ready';

export interface EventMap {
  // ---- lifecycle ----
  app_opened: { cold_start: boolean };
  screen_viewed: { screen: string; path: string };

  // ---- onboarding funnel (drop-off measurement) ----
  onboarding_step_viewed: { step: OnboardingStep; index: number; total: number };
  onboarding_step_completed: { step: OnboardingStep; index: number; duration_ms: number };
  onboarding_step_skipped: { step: OnboardingStep; index: number };
  onboarding_abandoned: { step: OnboardingStep; index: number };
  onboarding_completed: { duration_ms: number; goals: string[]; days_per_week: number };

  // ---- activity ----
  goal_reached: {
    metric: 'steps' | 'active_minutes' | 'water' | 'calories';
    value: number;
    goal: number;
  };
  water_logged: { amount_ml: number; total_ml: number };
  meal_logged: { kcal: number; total_kcal: number };

  // ---- workouts ----
  workout_viewed: { workout_id: string; source: 'today' | 'library' | 'coach' };
  workout_started: { workout_id: string; duration_min: number };
  workout_paused: { workout_id: string; elapsed_s: number };
  workout_completed: { workout_id: string; elapsed_s: number; completion_pct: number };
  workout_abandoned: { workout_id: string; elapsed_s: number; completion_pct: number };

  // ---- coach (conversational AI) ----
  coach_opened: { source: 'tab' | 'today_card' | 'suggestion' };
  coach_message_sent: { chars: number; suggestion_used: boolean };
  coach_response_received: { latency_ms: number; streamed: boolean; fallback: boolean };
  coach_response_failed: { reason: string };
  coach_action_tapped: { action: 'start_workout' | 'log_water' | 'open_insights' };

  // ---- experiments ----
  experiment_exposure: { experiment: string; variant: string };

  // ---- settings / a11y ----
  theme_changed: { preference: 'system' | 'light' | 'dark' };
  reduce_motion_changed: { enabled: boolean };
  units_changed: { units: 'metric' | 'imperial' };
}

export type EventName = keyof EventMap;

export interface AnalyticsEvent<N extends EventName = EventName> {
  name: N;
  props: EventMap[N];
  ts: number;
  session_id: string;
  anonymous_id: string;
  platform: 'ios' | 'android' | 'web';
  app_version: string;
  /** Active experiment assignments at time of event, for segmentation. */
  experiments: Record<string, string>;
}
