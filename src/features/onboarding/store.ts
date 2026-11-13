import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { OnboardingStep } from '@/analytics/events';
import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

export const ONBOARDING_STEPS: readonly OnboardingStep[] = [
  'welcome',
  'goals',
  'about_you',
  'schedule',
  'ready',
];

export type Goal =
  'lose_weight' | 'build_muscle' | 'stay_active' | 'sleep_better' | 'reduce_stress' | 'run_further';
export type ActivityLevel = 'light' | 'moderate' | 'active';
export type Units = 'metric' | 'imperial';

export const GOAL_OPTIONS: { id: Goal; label: string }[] = [
  { id: 'lose_weight', label: 'Lose weight' },
  { id: 'build_muscle', label: 'Build muscle' },
  { id: 'stay_active', label: 'Stay active' },
  { id: 'sleep_better', label: 'Sleep better' },
  { id: 'reduce_stress', label: 'Reduce stress' },
  { id: 'run_further', label: 'Run further' },
];

export interface Profile {
  name: string;
  goals: Goal[];
  units: Units;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: ActivityLevel;
  daysPerWeek: number;
  reminderHour: number | null; // 24h local
  /** Derived daily targets. */
  targets: { steps: number; activeMinutes: number; waterMl: number; kcal: number };
}

interface OnboardingState {
  completed: boolean;
  startedAt: number | null;
  profile: Profile;
  setProfile: (patch: Partial<Profile>) => void;
  toggleGoal: (g: Goal) => void;
  start: () => void;
  complete: () => void;
  reset: () => void;
}

export const defaultProfile: Profile = {
  name: '',
  goals: [],
  units: 'metric',
  heightCm: null,
  weightKg: null,
  activityLevel: 'moderate',
  daysPerWeek: 3,
  reminderHour: 8,
  targets: { steps: 8000, activeMinutes: 30, waterMl: 2000, kcal: 2100 },
};

/** Simple, transparent target derivation (not medical advice). */
export function deriveTargets(p: Omit<Profile, 'targets'>): Profile['targets'] {
  const base = { light: 6000, moderate: 8000, active: 10000 }[p.activityLevel];
  const steps = p.goals.includes('lose_weight') ? base + 2000 : base;
  const activeMinutes =
    p.goals.includes('build_muscle') || p.goals.includes('run_further') ? 40 : 30;
  const waterMl = p.weightKg ? Math.round((p.weightKg * 33) / 50) * 50 : 2000;
  const kcal = p.goals.includes('lose_weight')
    ? 1900
    : p.goals.includes('build_muscle')
      ? 2400
      : 2100;
  return { steps, activeMinutes, waterMl, kcal };
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      completed: false,
      startedAt: null,
      profile: defaultProfile,
      setProfile: (patch) =>
        set((s) => {
          const merged = { ...s.profile, ...patch };
          return { profile: { ...merged, targets: deriveTargets(merged) } };
        }),
      toggleGoal: (g) => {
        const goals = get().profile.goals;
        get().setProfile({
          goals: goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g],
        });
      },
      start: () => set((s) => ({ startedAt: s.startedAt ?? Date.now() })),
      complete: () => set({ completed: true }),
      reset: () => set({ completed: false, startedAt: null, profile: defaultProfile }),
    }),
    { name: STORAGE_KEYS.onboarding, storage: persistStorage },
  ),
);
