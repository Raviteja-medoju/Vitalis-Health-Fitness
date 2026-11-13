import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createId } from '@/lib/id';
import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

export interface WorkoutSessionLog {
  id: string;
  workoutId: string;
  startedAt: number;
  endedAt: number;
  elapsedS: number;
  completionPct: number;
  kcal: number;
}

interface WorkoutsState {
  history: WorkoutSessionLog[];
  savedIds: string[];
  toggleSaved: (id: string) => void;
  log: (entry: Omit<WorkoutSessionLog, 'id'>) => WorkoutSessionLog;
  streakDays: () => number;
  reset: () => void;
}

export const useWorkoutsStore = create<WorkoutsState>()(
  persist(
    (set, get) => ({
      history: [],
      savedIds: [],
      toggleSaved: (id) =>
        set((s) => ({
          savedIds: s.savedIds.includes(id)
            ? s.savedIds.filter((saved) => saved !== id)
            : [...s.savedIds, id],
        })),
      log: (entry) => {
        const rec = { ...entry, id: createId('w') };
        set((s) => ({ history: [rec, ...s.history].slice(0, 500) }));
        return rec;
      },
      streakDays: () => {
        const days = new Set(get().history.map((h) => new Date(h.endedAt).toDateString()));
        let streak = 0;
        const d = new Date();
        while (days.has(d.toDateString())) {
          streak++;
          d.setDate(d.getDate() - 1);
        }
        return streak;
      },
      reset: () => set({ history: [], savedIds: [] }),
    }),
    { name: STORAGE_KEYS.workouts, storage: persistStorage },
  ),
);
