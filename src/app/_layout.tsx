import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ReduceMotion, ReducedMotionConfig } from 'react-native-reanimated';

import { AnalyticsProvider, ScreenTracker } from '@/analytics';
import { ThemeProvider, useMotionPreference, useTheme, useThemePreference } from '@/design-system';
import { useExperimentsStore } from '@/experiments';
import { useActivityStore } from '@/features/activity/store';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { colors, isDark } = useTheme();
  const { ready } = useThemePreference();
  const reduceMotion = useMotionPreference();
  const seedDemo = useActivityStore((s) => s.seedDemo);

  useEffect(() => {
    seedDemo();
  }, [seedDemo]);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  return (
    <>
      <ReducedMotionConfig mode={reduceMotion ? ReduceMotion.Always : ReduceMotion.Never} />
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <ScreenTracker />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg.canvas },
          animation: reduceMotion ? 'none' : 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(onboarding)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="workout/[id]" options={{ presentation: 'card' }} />
        <Stack.Screen
          name="workout/session/[id]"
          options={{ presentation: 'fullScreenModal', gestureEnabled: false }}
        />
        <Stack.Screen name="insights" options={{ presentation: 'modal' }} />
        <Stack.Screen name="design-system" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const allAssignments = useExperimentsStore((s) => s.allAssignments);
  const getExperiments = useCallback(() => allAssignments(), [allAssignments]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AnalyticsProvider getExperiments={getExperiments}>
            <Root />
          </AnalyticsProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
