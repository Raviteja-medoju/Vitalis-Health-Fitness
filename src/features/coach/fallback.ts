import type { CoachAction, CoachContext } from './types';

/**
 * On-device, rule-based coach used when the model backend is unreachable or not configured.
 * Keeps the feature usable offline and in demos; never claims to be medical advice.
 */
export function fallbackReply(
  input: string,
  ctx: CoachContext,
): { text: string; actions: CoachAction[] } {
  const q = input.toLowerCase();
  const name = ctx.name ? `, ${ctx.name}` : '';
  const stepsLeft = Math.max(0, ctx.today.stepsGoal - ctx.today.steps);
  const waterLeft = Math.max(0, ctx.today.waterGoal - ctx.today.waterMl);
  const byLength = [...ctx.availableWorkouts].sort((a, b) => a.durationMin - b.durationMin);
  const short =
    byLength.find((w) => w.durationMin <= 15 && w.category !== 'mindfulness') ?? byLength[0];
  const calm = ctx.availableWorkouts.find(
    (w) => w.category === 'mindfulness' || w.category === 'mobility',
  );

  if (/(tired|exhaust|low energy|sore)/.test(q)) {
    return {
      text: `Sounds like a recovery day${name}. A light mobility session or a short walk keeps the streak alive without digging a deeper hole. Hydration helps too: you're ${waterLeft} ml from today's goal.`,
      actions: [
        calm ? { type: 'start_workout', label: `Start ${calm.title}`, workoutId: calm.id } : null,
        { type: 'log_water', label: 'Log 250 ml water', amountMl: 250 },
      ].filter(Boolean) as CoachAction[],
    };
  }
  if (/(stress|anxious|overwhelm|sleep)/.test(q)) {
    return {
      text: `Let's downshift${name}. Five minutes of box breathing lowers heart rate and makes it easier to fall asleep later. Dim screens 30 minutes before bed if you can.`,
      actions: calm
        ? [{ type: 'start_workout', label: `Start ${calm.title}`, workoutId: calm.id }]
        : [],
    };
  }
  if (/(water|hydrat|drink)/.test(q)) {
    return {
      text:
        waterLeft > 0
          ? `You've had ${ctx.today.waterMl} ml so far. ${waterLeft} ml more hits your goal; a glass now and one with each meal gets you there.`
          : `You've already hit today's water goal. Nice work.`,
      actions:
        waterLeft > 0 ? [{ type: 'log_water', label: 'Log 250 ml water', amountMl: 250 }] : [],
    };
  }
  if (/(eat|food|meal|calorie|protein|snack|hungry)/.test(q)) {
    const left = Math.max(0, ctx.today.kcalGoal - ctx.today.kcalEaten);
    return {
      text: `You have about ${left} kcal left in today's budget. Anchor meals around protein and fibre (eggs, yogurt, beans, leafy greens) and you'll stay full longer. I can't give medical or diagnostic nutrition advice; for conditions like diabetes, check with a professional.`,
      actions: [{ type: 'open_insights', label: 'See this week' }],
    };
  }
  if (/(what should i do|workout|train|exercise|today|plan)/.test(q) || q.length < 12) {
    return {
      text: `Here's a plan for the next hour${name}: ${short ? `${short.title} (${short.durationMin} min)` : 'a short session'}, then a 10-minute walk to knock out ${stepsLeft.toLocaleString()} remaining steps. That gets you most of the way to today's goals.`,
      actions: short
        ? [{ type: 'start_workout', label: `Start ${short.title}`, workoutId: short.id }]
        : [],
    };
  }
  return {
    text: `Got it${name}. Based on today: ${ctx.today.steps.toLocaleString()} of ${ctx.today.stepsGoal.toLocaleString()} steps and ${ctx.today.activeMinutes} active minutes. Tell me how you feel or how much time you have and I'll suggest something specific.`,
    actions: short
      ? [{ type: 'start_workout', label: `Start ${short.title}`, workoutId: short.id }]
      : [],
  };
}
