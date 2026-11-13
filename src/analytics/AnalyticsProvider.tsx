import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { usePathname, useSegments } from 'expo-router';
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { createId } from '@/lib/id';
import { STORAGE_KEYS } from '@/lib/storage';

import { ConsoleAdapter, HotjarAdapter, HttpBatchAdapter, type AnalyticsAdapter } from './adapters';
import { Analytics, noopAnalytics } from './Analytics';

const AnalyticsContext = createContext<Analytics>(noopAnalytics);

export function AnalyticsProvider({
  children,
  getExperiments,
  adapters,
}: {
  children: React.ReactNode;
  getExperiments?: () => Record<string, string>;
  /** Override adapters (tests). */
  adapters?: AnalyticsAdapter[];
}) {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(STORAGE_KEYS.analytics)
      .then(async (v) => {
        if (v) return v;
        const id = createId('u');
        await AsyncStorage.setItem(STORAGE_KEYS.analytics, id);
        return id;
      })
      .then((id) => mounted && setAnonymousId(id))
      .catch(() => mounted && setAnonymousId(createId('u')));
    return () => {
      mounted = false;
    };
  }, []);

  const analytics = useMemo(() => {
    if (!anonymousId) return null;
    const list: AnalyticsAdapter[] = adapters ?? [new ConsoleAdapter()];
    if (!adapters) {
      const endpoint = process.env.EXPO_PUBLIC_ANALYTICS_ENDPOINT;
      if (endpoint) list.push(new HttpBatchAdapter(endpoint));
      const hj = Number(process.env.EXPO_PUBLIC_HOTJAR_SITE_ID);
      if (hj) list.push(new HotjarAdapter(hj));
    }
    return new Analytics({
      adapters: list,
      anonymousId,
      appVersion: Constants.expoConfig?.version ?? '0.0.0',
      getExperiments,
    });
  }, [anonymousId, adapters, getExperiments]);

  // Flush on background.
  useEffect(() => {
    if (!analytics) return;
    analytics.track('app_opened', { cold_start: true });
    const sub = AppState.addEventListener('change', (s) => {
      if (s === 'background' || s === 'inactive') void analytics.flush();
    });
    return () => sub.remove();
  }, [analytics]);

  return (
    <AnalyticsContext.Provider value={analytics ?? noopAnalytics}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  return useContext(AnalyticsContext);
}

/** Mount once inside the router to emit screen_viewed on every route change. */
export function ScreenTracker() {
  const analytics = useAnalytics();
  const pathname = usePathname();
  const segments = useSegments();
  const last = useRef<string | null>(null);
  useEffect(() => {
    if (!pathname || last.current === pathname) return;
    last.current = pathname;
    analytics.track('screen_viewed', {
      screen: segments[segments.length - 1] ?? 'index',
      path: pathname,
    });
  }, [pathname, segments, analytics]);
  return null;
}
