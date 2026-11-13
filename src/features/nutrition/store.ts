import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { todayKey, type DayKey } from '@/lib/date';
import { createId } from '@/lib/id';
import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

export interface MealEntry {
  id: string;
  day: DayKey;
  name: string;
  kcal: number;
  at: number;
}

interface NutritionState {
  meals: MealEntry[];
  addMeal: (name: string, kcal: number, day?: DayKey) => MealEntry;
  removeMeal: (id: string) => void;
  restoreMeal: (entry: MealEntry) => boolean;
  mealsFor: (day?: DayKey) => MealEntry[];
  reset: () => void;
}

export const useNutritionStore = create<NutritionState>()(
  persist(
    (set, get) => ({
      meals: [],
      addMeal: (name, kcal, day = todayKey()) => {
        const m: MealEntry = {
          id: createId('m'),
          day,
          name: name.trim(),
          kcal: Math.round(kcal),
          at: Date.now(),
        };
        set((s) => ({ meals: [m, ...s.meals].slice(0, 2000) }));
        return m;
      },
      removeMeal: (id) => set((s) => ({ meals: s.meals.filter((m) => m.id !== id) })),
      restoreMeal: (entry) => {
        if (get().meals.some((meal) => meal.id === entry.id)) return false;
        set((s) => ({ meals: [...s.meals, entry].sort((a, b) => b.at - a.at).slice(0, 2000) }));
        return true;
      },
      mealsFor: (day = todayKey()) => get().meals.filter((m) => m.day === day),
      reset: () => set({ meals: [] }),
    }),
    { name: STORAGE_KEYS.nutrition, storage: persistStorage },
  ),
);

export const QUICK_MEALS: { name: string; kcal: number }[] = [
  { name: 'Oatmeal & berries', kcal: 320 },
  { name: 'Greek yogurt', kcal: 150 },
  { name: 'Chicken salad', kcal: 420 },
  { name: 'Banana', kcal: 105 },
  { name: 'Protein shake', kcal: 220 },
  { name: 'Salmon & rice', kcal: 560 },
];
