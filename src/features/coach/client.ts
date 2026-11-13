import type { CoachAction, CoachContext, CoachMessage } from './types';

export interface CoachStreamHandlers {
  onToken: (text: string) => void;
  onActions?: (actions: CoachAction[]) => void;
  onDone: (meta: { streamed: boolean }) => void;
  onError: (err: Error) => void;
}

export const COACH_API_URL = process.env.EXPO_PUBLIC_COACH_API_URL ?? '';

/**
 * Streams a coach reply from the backend (server/) as Server-Sent Events.
 * The backend owns the Anthropic API key; the client only sends conversation + context.
 */
export async function streamCoachReply(
  history: Pick<CoachMessage, 'role' | 'text'>[],
  context: CoachContext,
  handlers: CoachStreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  if (!COACH_API_URL) {
    handlers.onError(new Error('COACH_API_URL_NOT_CONFIGURED'));
    return;
  }
  let res: Response;
  try {
    res = await fetch(`${COACH_API_URL.replace(/\/$/, '')}/api/coach`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'text/event-stream' },
      body: JSON.stringify({
        messages: history.map((m) => ({ role: m.role, content: m.text })),
        context,
      }),
      signal,
    });
  } catch (e) {
    handlers.onError(e instanceof Error ? e : new Error('NETWORK'));
    return;
  }
  if (!res.ok) {
    handlers.onError(new Error(`HTTP_${res.status}`));
    return;
  }

  // React Native's fetch may not expose a readable body stream; fall back to full text.
  if (!res.body || typeof (res.body as ReadableStream).getReader !== 'function') {
    const text = await res.text();
    consumeSse(text, handlers);
    handlers.onDone({ streamed: false });
    return;
  }

  const reader = (res.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buf = '';
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const idx = buf.lastIndexOf('\n\n');
      if (idx >= 0) {
        consumeSse(buf.slice(0, idx + 2), handlers);
        buf = buf.slice(idx + 2);
      }
    }
    if (buf.trim()) consumeSse(buf, handlers);
    handlers.onDone({ streamed: true });
  } catch (e) {
    handlers.onError(e instanceof Error ? e : new Error('STREAM'));
  }
}

function consumeSse(chunk: string, handlers: CoachStreamHandlers) {
  for (const block of chunk.split('\n\n')) {
    const lines = block.split('\n');
    let event = 'message';
    let data = '';
    for (const l of lines) {
      if (l.startsWith('event:')) event = l.slice(6).trim();
      else if (l.startsWith('data:')) data += l.slice(5).trim();
    }
    if (!data) continue;
    try {
      const payload = JSON.parse(data) as {
        text?: string;
        actions?: CoachAction[];
        message?: string;
      };
      if (event === 'token' && payload.text) handlers.onToken(payload.text);
      else if (event === 'actions' && payload.actions) handlers.onActions?.(payload.actions);
      else if (event === 'error') handlers.onError(new Error(payload.message ?? 'SERVER'));
    } catch {
      // ignore malformed frames
    }
  }
}
