import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { lastNDays, todayKey, type DayKey } from '@/lib/date';
import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

export interface DayMetrics {
  steps: number;
  activeMinutes: number;
  kcalBurned: number;
  waterMl: number;
  kcalEaten: number;
  sleepHours: number;
  workoutsCompleted: number;
}

export const emptyDay: DayMetrics = {
  steps: 0,
  activeMinutes: 0,
  kcalBurned: 0,
  waterMl: 0,
  kcalEaten: 0,
  sleepHours: 0,
  workoutsCompleted: 0,
};

interface ActivityState {
  days: Record<DayKey, DayMetrics>;
  /** Simulated device/HealthKit sync for demo purposes; replace with expo-health / Health Connect. */
  seeded: boolean;
  get: (day?: DayKey) => DayMetrics;
  add: (patch: Partial<DayMetrics>, day?: DayKey) => void;
  setSleep: (hours: number, day?: DayKey) => void;
  seedDemo: () => void;
  week: () => { day: DayKey; metrics: DayMetrics }[];
  reset: () => void;
}

export const useActivityStore = create<ActivityState>()(
  persist(
    (set, get) => ({
      days: {},
      seeded: false,
      get: (day = todayKey()) => get().days[day] ?? emptyDay,
      add: (patch, day = todayKey()) =>
        set((s) => {
          const cur = s.days[day] ?? emptyDay;
          const next: DayMetrics = { ...cur };
          for (const k of Object.keys(patch) as (keyof DayMetrics)[]) {
            next[k] = Math.max(0, cur[k] + (patch[k] ?? 0));
          }
          return { days: { ...s.days, [day]: next } };
        }),
      setSleep: (hours, day = todayKey()) =>
        set((s) => ({
          days: { ...s.days, [day]: { ...(s.days[day] ?? emptyDay), sleepHours: hours } },
        })),
      seedDemo: () => {
        if (get().seeded) return;
        const days: Record<DayKey, DayMetrics> = {};
        const keys = lastNDays(7);
        keys.forEach((k, i) => {
          const isToday = i === keys.length - 1;
          const r = (n: number) => Math.round(n * (0.7 + ((i * 37) % 10) / 20));
          days[k] = isToday
            ? {
                ...emptyDay,
                steps: 3240,
                activeMinutes: 12,
                kcalBurned: 210,
                waterMl: 500,
                kcalEaten: 640,
                sleepHours: 7.2,
              }
            : {
                steps: r(8200),
                activeMinutes: r(34),
                kcalBurned: r(420),
                waterMl: r(1900),
                kcalEaten: r(2050),
                sleepHours: 6 + ((i * 13) % 5) * 0.4,
                workoutsCompleted: i % 2,
              };
        });
        set({ days, seeded: true });
      },
      week: () => lastNDays(7).map((day) => ({ day, metrics: get().days[day] ?? emptyDay })),
      reset: () => set({ days: {}, seeded: false }),
    }),
    { name: STORAGE_KEYS.activity, storage: persistStorage },
  ),
);
