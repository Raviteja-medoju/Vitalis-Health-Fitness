import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createId } from '@/lib/id';
import { persistStorage, STORAGE_KEYS } from '@/lib/storage';

import { assignVariant } from './assign';
import { experiments, type ExperimentKey, type VariantOf } from './registry';

interface ExperimentsState {
  unitId: string;
  /** Manual overrides (QA / design review). */
  overrides: Partial<Record<ExperimentKey, string>>;
  /** Experiments already exposure-logged this install (log once per unit). */
  exposed: Partial<Record<ExperimentKey, string>>;
  variantFor: <K extends ExperimentKey>(key: K) => VariantOf<K>;
  allAssignments: () => Record<string, string>;
  setOverride: (key: ExperimentKey, variant: string | null) => void;
  markExposed: (key: ExperimentKey, variant: string) => boolean;
  reset: () => void;
}

export const useExperimentsStore = create<ExperimentsState>()(
  persist(
    (set, get) => ({
      unitId: createId('x'),
      overrides: {},
      exposed: {},
      variantFor: (key) => {
        const def = experiments[key];
        const o = get().overrides[key];
        if (o && def.variants.some((v) => v.id === o)) return o as VariantOf<typeof key>;
        return assignVariant(def, get().unitId) as VariantOf<typeof key>;
      },
      allAssignments: () => {
        const out: Record<string, string> = {};
        for (const k of Object.keys(experiments) as ExperimentKey[]) out[k] = get().variantFor(k);
        return out;
      },
      setOverride: (key, variant) =>
        set((s) => {
          const overrides = { ...s.overrides };
          if (variant) overrides[key] = variant;
          else delete overrides[key];
          return { overrides };
        }),
      markExposed: (key, variant) => {
        if (get().exposed[key] === variant) return false;
        set((s) => ({ exposed: { ...s.exposed, [key]: variant } }));
        return true;
      },
      reset: () => set({ unitId: createId('x'), overrides: {}, exposed: {} }),
    }),
    {
      name: STORAGE_KEYS.experiments,
      storage: persistStorage,
      partialize: (s) => ({ unitId: s.unitId, overrides: s.overrides, exposed: s.exposed }),
    },
  ),
);
