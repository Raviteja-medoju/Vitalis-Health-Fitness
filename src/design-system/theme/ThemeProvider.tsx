import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { createTheme, lightTheme, type ColorScheme, type Theme } from './theme';

export type ThemePreference = 'system' | ColorScheme;

interface ThemeContextValue {
  theme: Theme;
  preference: ThemePreference;
  setPreference: (p: ThemePreference) => void;
  ready: boolean;
}

const STORAGE_KEY = 'vitalis.theme.preference';

const ThemeContext = createContext<ThemeContextValue>({
  theme: lightTheme,
  preference: 'system',
  setPreference: () => {},
  ready: false,
});

export function ThemeProvider({
  children,
  initialPreference,
}: {
  children: React.ReactNode;
  initialPreference?: ThemePreference;
}) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>(initialPreference ?? 'system');
  const [ready, setReady] = useState(Boolean(initialPreference));

  useEffect(() => {
    if (initialPreference) return;
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((v) => {
        if (!cancelled && (v === 'light' || v === 'dark' || v === 'system')) {
          setPreferenceState(v);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setReady(true));
    return () => {
      cancelled = true;
    };
  }, [initialPreference]);

  const setPreference = useCallback((p: ThemePreference) => {
    setPreferenceState(p);
    AsyncStorage.setItem(STORAGE_KEY, p).catch(() => {});
  }, []);

  const scheme: ColorScheme =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  const value = useMemo<ThemeContextValue>(
    () => ({ theme: createTheme(scheme), preference, setPreference, ready }),
    [scheme, preference, setPreference, ready],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext).theme;
}

export function useThemePreference() {
  const { preference, setPreference, ready } = useContext(ThemeContext);
  return { preference, setPreference, ready };
}
