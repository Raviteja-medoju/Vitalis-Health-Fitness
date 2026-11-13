import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Card, Chip, Text, useTheme } from '@/design-system';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/features/onboarding/store';

const DAYS = [2, 3, 4, 5, 6];
const HOURS: { value: number | null; label: string }[] = [
  { value: 7, label: '7:00' },
  { value: 8, label: '8:00' },
  { value: 12, label: '12:00' },
  { value: 18, label: '18:00' },
  { value: null, label: 'No reminders' },
];

export default function Schedule() {
  const { spacing } = useTheme();
  const profile = useOnboardingStore((s) => s.profile);
  const setProfile = useOnboardingStore((s) => s.setProfile);

  return (
    <OnboardingShell
      step="schedule"
      title="How often can you train?"
      subtitle="Consistency beats intensity. We'll plan around this and nudge you gently."
      onNext={() => router.push('/(onboarding)/ready')}
    >
      <View style={{ gap: spacing['2'] }}>
        <Text variant="label" color="secondary">
          Days per week
        </Text>
        <View
          accessibilityRole="radiogroup"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}
        >
          {DAYS.map((d) => (
            <Chip
              key={d}
              label={`${d} days`}
              role="radio"
              selected={profile.daysPerWeek === d}
              onPress={() => setProfile({ daysPerWeek: d })}
            />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing['2'] }}>
        <Text variant="label" color="secondary">
          Daily reminder
        </Text>
        <View
          accessibilityRole="radiogroup"
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}
        >
          {HOURS.map((h) => (
            <Chip
              key={String(h.value)}
              label={h.label}
              role="radio"
              selected={profile.reminderHour === h.value}
              onPress={() => setProfile({ reminderHour: h.value })}
            />
          ))}
        </View>
      </View>

      <Card variant="brand">
        <Text variant="bodyStrong" color="brand">
          Your starting targets
        </Text>
        <Text
          variant="label"
          color="secondary"
          style={{ fontWeight: '400', marginTop: spacing['1'] }}
        >
          {profile.targets.steps.toLocaleString()} steps · {profile.targets.activeMinutes} active
          min · {profile.targets.waterMl.toLocaleString()} ml water ·{' '}
          {profile.targets.kcal.toLocaleString()} kcal
        </Text>
      </Card>
    </OnboardingShell>
  );
}
