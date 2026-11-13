import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

interface SettingsState {
  /** In-app Reduce Motion override (null = follow OS). */
  reduceMotion: boolean | null;
  hapticsEnabled: boolean;
  analyticsConsent: boolean;
  set: (patch: Partial<Omit<SettingsState, 'set'>>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      reduceMotion: null,
      hapticsEnabled: true,
      analyticsConsent: true,
      set: (patch) => set(patch),
    }),
    { name: STORAGE_KEYS.settings, storage: persistStorage },
  ),
);
