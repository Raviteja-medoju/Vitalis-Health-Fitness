import { useEffect } from 'react';

import { useAnalytics } from '@/analytics';

import type { ExperimentKey, VariantOf } from './registry';
import { useExperimentsStore } from './store';

/**
 * Returns the assigned variant and logs a single exposure event the first
 * time the user actually sees the experiment surface.
 */
export function useExperiment<K extends ExperimentKey>(key: K): VariantOf<K> {
  const variantFor = useExperimentsStore((s) => s.variantFor);
  const markExposed = useExperimentsStore((s) => s.markExposed);
  const overrides = useExperimentsStore((s) => s.overrides);
  const analytics = useAnalytics();
  const variant = variantFor(key);

  useEffect(() => {
    if (markExposed(key, variant)) {
      analytics.track('experiment_exposure', { experiment: key, variant });
    }
    // overrides included so a QA override re-logs exposure for the new variant
  }, [key, variant, markExposed, analytics, overrides]);

  return variant;
}
