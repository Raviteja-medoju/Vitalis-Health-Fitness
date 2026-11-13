import { hashToUnit } from '@/lib/id';

import type { ExperimentDefinition } from './registry';

/**
 * Deterministic bucketing: same (unit, experiment) always yields the same variant,
 * across devices and app versions, with no server round-trip.
 */
export function assignVariant<V extends string>(def: ExperimentDefinition<V>, unitId: string): V {
  const first = def.variants[0];
  if (!first) throw new Error(`Experiment ${def.key} has no variants`);
  if (!def.enabled) return first.id;
  const total = def.variants.reduce((s, v) => s + v.weight, 0);
  if (total <= 0) return first.id;
  const point = hashToUnit(`${def.key}::${unitId}`) * total;
  let acc = 0;
  for (const v of def.variants) {
    acc += v.weight;
    if (point < acc) return v.id;
  }
  return def.variants[def.variants.length - 1]?.id ?? first.id;
}
