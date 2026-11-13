import { Analytics } from '@/analytics/Analytics';
import type { AnalyticsAdapter } from '@/analytics/adapters';
import type { AnalyticsEvent } from '@/analytics/events';

function makeAdapter() {
  const events: AnalyticsEvent[] = [];
  const adapter: AnalyticsAdapter = { name: 'mem', track: (e) => void events.push(e) };
  return { adapter, events };
}

describe('Analytics', () => {
  it('enriches events with session, platform and experiments', () => {
    const { adapter, events } = makeAdapter();
    const a = new Analytics({
      adapters: [adapter],
      anonymousId: 'anon-1',
      appVersion: '1.2.3',
      getExperiments: () => ({ exp: 'b' }),
      now: () => 1000,
    });
    a.track('water_logged', { amount_ml: 250, total_ml: 750 });
    expect(events).toHaveLength(1);
    const e = events[0]!;
    expect(e.name).toBe('water_logged');
    expect(e.anonymous_id).toBe('anon-1');
    expect(e.app_version).toBe('1.2.3');
    expect(e.experiments).toEqual({ exp: 'b' });
    expect(e.ts).toBe(1000);
    expect(e.session_id).toMatch(/^s_/);
  });

  it('buffers events until consent is granted, then replays in order', () => {
    const { adapter, events } = makeAdapter();
    const a = new Analytics({
      adapters: [adapter],
      anonymousId: 'x',
      appVersion: '1',
      consent: false,
    });
    a.track('onboarding_step_viewed', { step: 'welcome', index: 0, total: 5 });
    a.track('onboarding_step_completed', { step: 'welcome', index: 0, duration_ms: 1200 });
    expect(events).toHaveLength(0);
    a.setConsent(true);
    expect(events.map((e) => e.name)).toEqual([
      'onboarding_step_viewed',
      'onboarding_step_completed',
    ]);
  });

  it('drops the buffer when consent is revoked', () => {
    const { adapter, events } = makeAdapter();
    const a = new Analytics({
      adapters: [adapter],
      anonymousId: 'x',
      appVersion: '1',
      consent: false,
    });
    a.track('app_opened', { cold_start: true });
    a.setConsent(false);
    a.setConsent(true);
    expect(events).toHaveLength(0);
  });

  it('startTimer measures elapsed time', () => {
    let t = 0;
    const a = new Analytics({ adapters: [], anonymousId: 'x', appVersion: '1', now: () => t });
    const stop = a.startTimer();
    t = 4321;
    expect(stop()).toBe(4321);
  });

  it('isolates adapter failures', () => {
    const bad: AnalyticsAdapter = {
      name: 'bad',
      track: () => {
        throw new Error('boom');
      },
    };
    const { adapter, events } = makeAdapter();
    const a = new Analytics({ adapters: [bad, adapter], anonymousId: 'x', appVersion: '1' });
    expect(() => a.track('app_opened', { cold_start: false })).not.toThrow();
    expect(events).toHaveLength(1);
  });
});
