import { Stack } from 'expo-router';
import React from 'react';

import { useMotionPreference, useTheme } from '@/design-system';

export default function OnboardingLayout() {
  const { colors } = useTheme();
  const reduceMotion = useMotionPreference();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.bg.canvas },
        animation: reduceMotion ? 'none' : 'slide_from_right',
      }}
    />
  );
}
