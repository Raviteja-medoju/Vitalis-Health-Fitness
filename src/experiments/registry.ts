/**
 * Experiment registry. Each experiment declares its variants and traffic weights.
 * Adding an experiment is a code review (design + data sign-off), see docs/EXPERIMENTS.md.
 */
export interface ExperimentDefinition<V extends string = string> {
  key: string;
  description: string;
  /** Primary metric the experiment is powered for. */
  primaryMetric: string;
  variants: readonly { id: V; weight: number }[];
  /** Kill switch: when false everyone gets the first variant (control). */
  enabled: boolean;
}

export const experiments = {
  /** Does showing a progress bar + "takes 60s" copy on onboarding reduce registration drop-off? */
  onboarding_progress_copy: {
    key: 'onboarding_progress_copy',
    description: 'Progress indicator style on onboarding steps',
    primaryMetric: 'onboarding_completed / onboarding_step_viewed[welcome]',
    variants: [
      { id: 'control', weight: 50 },
      { id: 'time_estimate', weight: 50 },
    ],
    enabled: true,
  },
  /** Does a contextual "Start now" CTA on the Today hero increase workout starts? */
  today_primary_cta: {
    key: 'today_primary_cta',
    description: 'Copy of the primary CTA on the Today hero card',
    primaryMetric: 'workout_started / screen_viewed[today]',
    variants: [
      { id: 'control', weight: 34 },
      { id: 'start_now', weight: 33 },
      { id: 'minutes_left', weight: 33 },
    ],
    enabled: true,
  },
  /** Does surfacing coach suggestions as chips increase coach engagement? */
  coach_suggestion_chips: {
    key: 'coach_suggestion_chips',
    description: 'Show quick-suggestion chips above the coach composer',
    primaryMetric: 'coach_message_sent / coach_opened',
    variants: [
      { id: 'control', weight: 50 },
      { id: 'chips', weight: 50 },
    ],
    enabled: true,
  },
} as const satisfies Record<string, ExperimentDefinition>;

export type ExperimentKey = keyof typeof experiments;
export type VariantOf<K extends ExperimentKey> = (typeof experiments)[K]['variants'][number]['id'];
