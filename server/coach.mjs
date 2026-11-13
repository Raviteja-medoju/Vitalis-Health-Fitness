/**
 * Coach domain logic: system prompt, context formatting, action extraction.
 * Kept separate from transport so it can be unit-tested without the network.
 */

export const MODEL = process.env.COACH_MODEL || 'claude-opus-5-5';

/**
 * Stable system prompt. Keep this byte-identical between requests so the
 * prompt-cache prefix hits; per-user context goes in the user turn.
 */
export const SYSTEM_PROMPT = `You are the in-app coach for Vitalis, a health and fitness app.

Your job: give the user one clear, specific next step for the next hour, grounded in the context JSON provided (today's progress, goals, available workouts, time of day). Be warm, brief and concrete. Prefer 2-5 short sentences; use a short list only when giving steps.

Rules:
- You are not a clinician. Do not diagnose, prescribe, or give medical nutrition therapy. If the user mentions pain, injury, chest pain, dizziness, pregnancy, an eating disorder, or a medical condition, say plainly that they should check with a qualified professional, and keep any suggestion gentle (walk, mobility, rest).
- Never shame. Never recommend extreme calorie restriction (below ~1,200 kcal/day) or exercising through pain.
- Only recommend workouts from availableWorkouts, referenced by exact id.
- Respect the user's units.
- End with exactly one line in this format when you suggest an action the app can perform, otherwise omit it:
  ACTIONS: [{"type":"start_workout","workoutId":"<id>","label":"Start <title>"}]
  Allowed action types: start_workout (requires workoutId), log_water (optional amountMl, default 250), open_insights.
  The ACTIONS line must be valid JSON on a single line and must be the final line.`;

export function buildContextBlock(context) {
  const safe = {
    name: String(context?.name ?? '').slice(0, 40),
    goals: Array.isArray(context?.goals) ? context.goals.slice(0, 6) : [],
    units: context?.units === 'imperial' ? 'imperial' : 'metric',
    daysPerWeek: Number(context?.daysPerWeek) || 3,
    today: context?.today ?? {},
    streakDays: Number(context?.streakDays) || 0,
    localHour: Number(context?.localHour) || 12,
    availableWorkouts: Array.isArray(context?.availableWorkouts)
      ? context.availableWorkouts.slice(0, 20)
      : [],
  };
  return `<context>\n${JSON.stringify(safe)}\n</context>`;
}

/** Normalise and bound the conversation coming from the client. */
export function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return [];
  const out = [];
  for (const m of messages.slice(-20)) {
    const role = m?.role === 'assistant' ? 'assistant' : 'user';
    const content = String(m?.content ?? '').slice(0, 4000);
    if (!content.trim()) continue;
    // merge consecutive same-role turns
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else out.push({ role, content });
  }
  // Conversation must start with a user turn.
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

const ALLOWED = new Set(['start_workout', 'log_water', 'open_insights']);

/**
 * Split the final ACTIONS line from the visible text. Returns { text, actions }.
 * Tolerant: if the line is malformed, the text is kept and actions are empty.
 */
export function extractActions(fullText, availableIds = new Set()) {
  const lines = fullText.trimEnd().split('\n');
  const lastLine = lines[lines.length - 1] ?? '';
  const m = lastLine.match(/^\s*ACTIONS:\s*(.*)$/);
  if (!m) return { text: fullText.trim(), actions: [] };
  let parsed = [];
  try {
    parsed = JSON.parse(m[1]);
  } catch {
    return { text: lines.slice(0, -1).join('\n').trim(), actions: [] };
  }
  const actions = (Array.isArray(parsed) ? parsed : [])
    .filter((a) => a && ALLOWED.has(a.type))
    .filter(
      (a) =>
        a.type !== 'start_workout' ||
        (a.workoutId && (!availableIds.size || availableIds.has(a.workoutId))),
    )
    .map((a) => ({
      type: a.type,
      label: String(a.label ?? defaultLabel(a)).slice(0, 40),
      ...(a.workoutId ? { workoutId: String(a.workoutId) } : {}),
      ...(a.amountMl ? { amountMl: Math.min(1000, Math.max(50, Number(a.amountMl) || 250)) } : {}),
    }))
    .slice(0, 3);
  return { text: lines.slice(0, -1).join('\n').trim(), actions };
}

function defaultLabel(a) {
  return a.type === 'log_water'
    ? 'Log water'
    : a.type === 'open_insights'
      ? 'See insights'
      : 'Start workout';
}

/** Detect the start of an ACTIONS line so streaming can stop forwarding tokens to the UI. */
export function visiblePortion(buffer) {
  const idx = buffer.lastIndexOf('\nACTIONS:');
  if (idx >= 0) return buffer.slice(0, idx);
  if (buffer.startsWith('ACTIONS:')) return '';
  return buffer;
}
