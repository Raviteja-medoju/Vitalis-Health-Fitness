import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, type StateStorage } from 'zustand/middleware';

const asyncStateStorage: StateStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

/** Shared persisted storage for zustand stores (works on iOS, Android and Web). */
export const persistStorage = createJSONStorage(() => asyncStateStorage);

export const STORAGE_KEYS = {
  onboarding: 'vitalis.onboarding.v1',
  activity: 'vitalis.activity.v1',
  workouts: 'vitalis.workouts.v1',
  nutrition: 'vitalis.nutrition.v1',
  coach: 'vitalis.coach.v1',
  experiments: 'vitalis.experiments.v1',
  analytics: 'vitalis.analytics.v1',
  settings: 'vitalis.settings.v1',
} as const;
