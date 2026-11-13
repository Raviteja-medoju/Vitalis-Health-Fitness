import { Platform } from 'react-native';

import { createId } from '@/lib/id';

import type { AnalyticsAdapter } from './adapters';
import type { AnalyticsEvent, EventMap, EventName } from './events';

export interface AnalyticsOptions {
  adapters: AnalyticsAdapter[];
  anonymousId: string;
  appVersion: string;
  /** Returns current experiment assignments so each event is segmentable. */
  getExperiments?: () => Record<string, string>;
  /** When false (no consent yet), events are buffered in memory until consent is granted. */
  consent?: boolean;
  now?: () => number;
}

export class Analytics {
  private sessionId = createId('s');
  private buffer: AnalyticsEvent[] = [];
  private consent: boolean;
  private readonly now: () => number;

  constructor(private opts: AnalyticsOptions) {
    this.consent = opts.consent ?? true;
    this.now = opts.now ?? Date.now;
    for (const a of opts.adapters) void a.init?.();
  }

  setConsent(granted: boolean) {
    this.consent = granted;
    if (granted) {
      const pending = this.buffer.splice(0, this.buffer.length);
      for (const e of pending) this.dispatch(e);
    } else {
      this.buffer = [];
    }
  }

  identify(traits: Record<string, unknown>) {
    for (const a of this.opts.adapters) a.identify?.(this.opts.anonymousId, traits);
  }

  track<N extends EventName>(name: N, props: EventMap[N]) {
    const event: AnalyticsEvent<N> = {
      name,
      props,
      ts: this.now(),
      session_id: this.sessionId,
      anonymous_id: this.opts.anonymousId,
      platform: Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : 'web',
      app_version: this.opts.appVersion,
      experiments: this.opts.getExperiments?.() ?? {},
    };
    if (!this.consent) {
      this.buffer.push(event);
      if (this.buffer.length > 200) this.buffer.shift();
      return;
    }
    this.dispatch(event);
  }

  /** Measure time between two points (e.g. step viewed -> completed). */
  startTimer(): () => number {
    const t0 = this.now();
    return () => this.now() - t0;
  }

  async flush() {
    await Promise.all(this.opts.adapters.map((a) => a.flush?.()));
  }

  private dispatch(event: AnalyticsEvent) {
    for (const a of this.opts.adapters) {
      try {
        void a.track(event);
      } catch (err) {
        if (__DEV__) console.warn(`[analytics] adapter ${a.name} failed`, err);
      }
    }
  }
}

/** No-op instance for tests / before provider mounts. */
export const noopAnalytics = new Analytics({
  adapters: [],
  anonymousId: 'anon',
  appVersion: '0.0.0',
});
