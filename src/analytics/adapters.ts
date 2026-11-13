import { Platform } from 'react-native';

import type { AnalyticsEvent } from './events';

export interface AnalyticsAdapter {
  name: string;
  init?(): void | Promise<void>;
  track(event: AnalyticsEvent): void | Promise<void>;
  identify?(anonymousId: string, traits: Record<string, unknown>): void;
  /** Flush buffered events (called on background / unload). */
  flush?(): void | Promise<void>;
}

/** Dev adapter: pretty-prints events. */
export class ConsoleAdapter implements AnalyticsAdapter {
  name = 'console';
  track(e: AnalyticsEvent) {
    if (__DEV__) {
      console.log(`[analytics] ${e.name}`, e.props);
    }
  }
}

/**
 * Batches events to your own collector (or a proxy to PostHog/Segment/Amplitude).
 * Keeps vendor SDKs out of the bundle and lets you enforce consent server-side.
 */
export class HttpBatchAdapter implements AnalyticsAdapter {
  name = 'http';
  private queue: AnalyticsEvent[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private endpoint: string,
    private opts: { batchSize?: number; intervalMs?: number; fetchImpl?: typeof fetch } = {},
  ) {}

  track(e: AnalyticsEvent) {
    this.queue.push(e);
    if (this.queue.length >= (this.opts.batchSize ?? 20)) {
      void this.flush();
    } else if (!this.timer) {
      this.timer = setTimeout(() => void this.flush(), this.opts.intervalMs ?? 5000);
    }
  }

  async flush() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    const f = this.opts.fetchImpl ?? fetch;
    try {
      await f(this.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ events: batch }),
        keepalive: true,
      });
    } catch {
      // Re-queue on failure (bounded to avoid unbounded growth).
      this.queue.unshift(...batch.slice(-100));
    }
  }
}

declare global {
  interface Window {
    hj?: (...args: unknown[]) => void;
    _hjSettings?: { hjid: number; hjsv: number };
  }
}

/**
 * Hotjar (web only). Injects the tracking snippet and forwards product events
 * as Hotjar Events so heatmaps/recordings can be filtered by funnel step.
 * Hotjar is loaded only after `init()`; gate that call behind consent.
 */
export class HotjarAdapter implements AnalyticsAdapter {
  name = 'hotjar';
  private ready = false;

  constructor(private siteId: number) {}

  init() {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !this.siteId) return;
    if (window.hj) {
      this.ready = true;
      return;
    }
    window.hj =
      window.hj ||
      function (...args: unknown[]) {
        ((window.hj as unknown as { q: unknown[] }).q =
          (window.hj as unknown as { q?: unknown[] }).q || []).push(args);
      };
    window._hjSettings = { hjid: this.siteId, hjsv: 6 };
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://static.hotjar.com/c/hotjar-${this.siteId}.js?sv=6`;
    document.head.appendChild(s);
    this.ready = true;
  }

  identify(anonymousId: string, traits: Record<string, unknown>) {
    if (this.ready) window.hj?.('identify', anonymousId, traits);
  }

  track(e: AnalyticsEvent) {
    if (!this.ready) return;
    // Hotjar event names: letters, digits, '-' and '_' only, max 750 chars.
    window.hj?.('event', e.name);
    if (e.name === 'screen_viewed') {
      window.hj?.('stateChange', (e.props as { path: string }).path);
    }
  }
}
