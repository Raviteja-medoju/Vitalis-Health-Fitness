import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

import { Chip, Text, useTheme } from '@/design-system';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { GOAL_OPTIONS, useOnboardingStore } from '@/features/onboarding/store';

export default function Goals() {
  const { spacing } = useTheme();
  const goals = useOnboardingStore((s) => s.profile.goals);
  const toggleGoal = useOnboardingStore((s) => s.toggleGoal);

  return (
    <OnboardingShell
      step="goals"
      title="What matters most right now?"
      subtitle="Pick up to three. We use these to tailor targets and workouts."
      nextDisabled={goals.length === 0}
      onNext={() => router.push('/(onboarding)/about-you')}
      onSkip={() => router.push('/(onboarding)/about-you')}
    >
      <View
        accessibilityRole="list"
        accessibilityLabel="Goals, multi-select"
        style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}
      >
        {GOAL_OPTIONS.map((g) => {
          const selected = goals.includes(g.id);
          const disabled = !selected && goals.length >= 3;
          return (
            <Chip
              key={g.id}
              testID={`goal-${g.id}`}
              label={g.label}
              selected={selected}
              disabled={disabled}
              role="checkbox"
              onPress={() => toggleGoal(g.id)}
            />
          );
        })}
      </View>
      <Text variant="caption" color="muted" accessibilityLiveRegion="polite">
        {goals.length === 0
          ? 'Choose at least one to continue, or skip.'
          : `${goals.length} of 3 selected`}
      </Text>
    </OnboardingShell>
  );
}
