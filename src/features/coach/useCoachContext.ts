import { useMemo } from 'react';

import { useActivityStore } from '@/features/activity/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { WORKOUTS } from '@/features/workouts/catalog';
import { useWorkoutsStore } from '@/features/workouts/store';

import type { CoachContext } from './types';

export function useCoachContext(): CoachContext {
  const profile = useOnboardingStore((s) => s.profile);
  const today = useActivityStore((s) => s.get());
  const streak = useWorkoutsStore((s) => s.streakDays());
  return useMemo<CoachContext>(
    () => ({
      name: profile.name,
      goals: profile.goals,
      units: profile.units,
      daysPerWeek: profile.daysPerWeek,
      today: {
        steps: today.steps,
        stepsGoal: profile.targets.steps,
        activeMinutes: today.activeMinutes,
        activeMinutesGoal: profile.targets.activeMinutes,
        waterMl: today.waterMl,
        waterGoal: profile.targets.waterMl,
        kcalEaten: today.kcalEaten,
        kcalGoal: profile.targets.kcal,
        sleepHours: today.sleepHours,
      },
      streakDays: streak,
      localHour: new Date().getHours(),
      availableWorkouts: WORKOUTS.map((w) => ({
        id: w.id,
        title: w.title,
        durationMin: w.durationMin,
        intensity: w.intensity,
        category: w.category,
      })),
    }),
    [profile, today, streak],
  );
}
