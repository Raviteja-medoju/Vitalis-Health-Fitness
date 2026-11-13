import { deriveTargets, useOnboardingStore } from '@/features/onboarding/store';

describe('onboarding store', () => {
  beforeEach(() => useOnboardingStore.getState().reset());

  it('derives targets from goals and activity level', () => {
    const t = deriveTargets({
      name: '',
      goals: ['lose_weight'],
      units: 'metric',
      heightCm: 170,
      weightKg: 70,
      activityLevel: 'moderate',
      daysPerWeek: 3,
      reminderHour: 8,
    });
    expect(t.steps).toBe(10000);
    expect(t.kcal).toBe(1900);
    expect(t.waterMl).toBe(2300);
  });

  it('toggles goals and recomputes targets', () => {
    const s = useOnboardingStore.getState();
    s.toggleGoal('build_muscle');
    expect(useOnboardingStore.getState().profile.goals).toEqual(['build_muscle']);
    expect(useOnboardingStore.getState().profile.targets.kcal).toBe(2400);
    useOnboardingStore.getState().toggleGoal('build_muscle');
    expect(useOnboardingStore.getState().profile.goals).toEqual([]);
  });

  it('records start once and completes', () => {
    const s = useOnboardingStore.getState();
    s.start();
    const first = useOnboardingStore.getState().startedAt;
    s.start();
    expect(useOnboardingStore.getState().startedAt).toBe(first);
    s.complete();
    expect(useOnboardingStore.getState().completed).toBe(true);
  });
});
