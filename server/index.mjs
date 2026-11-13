/**
 * Vitalis coach server.
 *
 * POST /api/coach  { messages: [{role, content}], context: CoachContext }
 *   -> text/event-stream with events:
 *        event: token    data: {"text": "..."}
 *        event: actions  data: {"actions": [...]}
 *        event: done     data: {"usage": {...}, "model": "..."}
 *        event: error    data: {"message": "..."}
 * GET  /healthz
 *
 * Runs on Node >= 20.6 with no framework. The Anthropic key never leaves this process.
 */
import Anthropic from '@anthropic-ai/sdk';
import http from 'node:http';

import {
  MODEL,
  SYSTEM_PROMPT,
  buildContextBlock,
  extractActions,
  sanitizeMessages,
  visiblePortion,
} from './coach.mjs';

const PORT = Number(process.env.PORT) || 8787;
const ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:19006')
  .split(',')
  .map((s) => s.trim());

// Credentials resolve from ANTHROPIC_API_KEY, ANTHROPIC_AUTH_TOKEN, or an `ant auth login` profile.
const client = new Anthropic();

// Simple per-IP token bucket to protect your API budget.
const buckets = new Map();
function allow(ip, limit = 30, windowMs = 60_000) {
  const now = Date.now();
  const b = buckets.get(ip) ?? { count: 0, reset: now + windowMs };
  if (now > b.reset) {
    b.count = 0;
    b.reset = now + windowMs;
  }
  b.count++;
  buckets.set(ip, b);
  return b.count <= limit;
}

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && (ORIGINS.includes('*') || ORIGINS.includes(origin))) {
    res.setHeader('access-control-allow-origin', origin);
    res.setHeader('vary', 'origin');
  }
  res.setHeader('access-control-allow-methods', 'POST, GET, OPTIONS');
  res.setHeader('access-control-allow-headers', 'content-type, accept');
}

function readJson(req, limit = 256 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) {
        reject(new Error('PAYLOAD_TOO_LARGE'));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'));
      } catch {
        reject(new Error('BAD_JSON'));
      }
    });
    req.on('error', reject);
  });
}

function sse(res) {
  res.writeHead(200, {
    'content-type': 'text/event-stream; charset=utf-8',
    'cache-control': 'no-cache, no-transform',
    connection: 'keep-alive',
    'x-accel-buffering': 'no',
  });
  return (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

async function handleCoach(req, res) {
  const ip = req.socket.remoteAddress ?? 'unknown';
  if (!allow(ip)) {
    res.writeHead(429, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'RATE_LIMITED' }));
    return;
  }

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: e.message }));
    return;
  }

  const messages = sanitizeMessages(body.messages);
  if (!messages.length) {
    res.writeHead(400, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ error: 'NO_USER_MESSAGE' }));
    return;
  }
  const availableIds = new Set((body.context?.availableWorkouts ?? []).map((w) => w.id));

  // Put volatile per-user context in the *last* user turn so the stable system prompt stays cacheable.
  const last = messages[messages.length - 1];
  last.content = `${buildContextBlock(body.context)}\n\n${last.content}`;

  const send = sse(res);
  const abort = new AbortController();
  req.on('close', () => abort.abort());

  let buffer = '';
  let forwarded = 0;

  try {
    const stream = client.beta.messages.stream(
      {
        model: MODEL,
        max_tokens: 1024,
        // Adaptive thinking is the default on this model; low effort keeps chat latency down.
        output_config: { effort: 'low' },
        // Server-side refusal fallback: if a safety classifier declines, the API re-runs on a fallback model.
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages,
      },
      { signal: abort.signal },
    );

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        buffer += event.delta.text;
        const visible = visiblePortion(buffer);
        if (visible.length > forwarded) {
          send('token', { text: visible.slice(forwarded) });
          forwarded = visible.length;
        }
      }
    }

    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') {
      send('error', { message: 'REFUSED', category: final.stop_details?.category ?? null });
      res.end();
      return;
    }
    const { text, actions } = extractActions(buffer, availableIds);
    if (text.length > forwarded) send('token', { text: text.slice(forwarded) });
    if (actions.length) send('actions', { actions });
    send('done', { model: final.model, usage: final.usage });
  } catch (err) {
    if (abort.signal.aborted) return;
    const status = err instanceof Anthropic.APIError ? err.status : undefined;
    const message =
      err instanceof Anthropic.AuthenticationError
        ? 'AUTH'
        : err instanceof Anthropic.RateLimitError
          ? 'RATE_LIMITED_UPSTREAM'
          : err instanceof Anthropic.APIConnectionError
            ? 'UPSTREAM_UNREACHABLE'
            : `UPSTREAM_${status ?? 'ERROR'}`;
    console.error('[coach]', message, err?.message);
    send('error', { message });
  } finally {
    res.end();
  }
}

const server = http.createServer(async (req, res) => {
  cors(req, res);
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (req.method === 'GET' && req.url === '/healthz') {
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ ok: true, model: MODEL }));
    return;
  }
  if (req.method === 'POST' && req.url === '/api/coach') {
    await handleCoach(req, res);
    return;
  }
  res.writeHead(404);
  res.end();
});

server.listen(PORT, () => {
  console.log(`Vitalis coach server listening on http://localhost:${PORT} (model: ${MODEL})`);
});
