import { assignVariant } from '@/experiments/assign';
import { experiments } from '@/experiments/registry';
import { hashToUnit } from '@/lib/id';

describe('hashToUnit', () => {
  it('is deterministic and in [0,1)', () => {
    for (const s of ['a', 'user_1', 'x'.repeat(100)]) {
      const v = hashToUnit(s);
      expect(v).toBe(hashToUnit(s));
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('assignVariant', () => {
  it('returns the same variant for the same unit', () => {
    const def = experiments.today_primary_cta;
    expect(assignVariant(def, 'unit-123')).toBe(assignVariant(def, 'unit-123'));
  });

  it('returns control when the experiment is disabled', () => {
    const def = { ...experiments.today_primary_cta, enabled: false };
    for (let i = 0; i < 50; i++) expect(assignVariant(def, `u${i}`)).toBe('control');
  });

  it('respects weights within tolerance over many units', () => {
    const def = experiments.onboarding_progress_copy; // 50/50
    const counts: Record<string, number> = {};
    const N = 5000;
    for (let i = 0; i < N; i++) {
      const v = assignVariant(def, `unit-${i}`);
      counts[v] = (counts[v] ?? 0) + 1;
    }
    expect(counts.control! / N).toBeGreaterThan(0.45);
    expect(counts.control! / N).toBeLessThan(0.55);
  });

  it('buckets independently per experiment (no correlated assignment)', () => {
    let same = 0;
    const N = 2000;
    for (let i = 0; i < N; i++) {
      const a = assignVariant(experiments.onboarding_progress_copy, `u${i}`) === 'control';
      const b = assignVariant(experiments.coach_suggestion_chips, `u${i}`) === 'control';
      if (a === b) same++;
    }
    // If independent, ~50% agree. Flag strong correlation.
    expect(same / N).toBeGreaterThan(0.4);
    expect(same / N).toBeLessThan(0.6);
  });
});
