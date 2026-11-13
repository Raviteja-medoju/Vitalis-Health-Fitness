import { fallbackReply } from '@/features/coach/fallback';
import type { CoachContext } from '@/features/coach/types';

const ctx: CoachContext = {
  name: 'Sam',
  goals: ['stay_active'],
  units: 'metric',
  daysPerWeek: 3,
  today: {
    steps: 3000,
    stepsGoal: 8000,
    activeMinutes: 10,
    activeMinutesGoal: 30,
    waterMl: 500,
    waterGoal: 2000,
    kcalEaten: 600,
    kcalGoal: 2100,
    sleepHours: 7,
  },
  streakDays: 2,
  localHour: 14,
  availableWorkouts: [
    {
      id: 'quick_core_10',
      title: '10-min Core Reset',
      durationMin: 10,
      intensity: 'moderate',
      category: 'strength',
    },
    {
      id: 'breath_5',
      title: '5-min Box Breathing',
      durationMin: 5,
      intensity: 'low',
      category: 'mindfulness',
    },
  ],
};

describe('coach fallback', () => {
  it('suggests recovery when tired', () => {
    const r = fallbackReply("I'm so tired today", ctx);
    expect(r.text).toMatch(/recovery/i);
    expect(r.actions.some((a) => a.type === 'log_water')).toBe(true);
  });

  it('reports remaining water', () => {
    const r = fallbackReply('how much water?', ctx);
    expect(r.text).toContain('1500 ml');
  });

  it('offers a short workout for a plan request with a valid workout id', () => {
    const r = fallbackReply('what should I do today?', ctx);
    const start = r.actions.find((a) => a.type === 'start_workout');
    expect(start?.workoutId).toBe('quick_core_10');
  });

  it('never gives medical nutrition advice', () => {
    const r = fallbackReply('I have diabetes, what should I eat?', ctx);
    expect(r.text).toMatch(/professional/i);
  });
});
