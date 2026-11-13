import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { useAnalytics } from '@/analytics';
import { ProgressRing, Text, spring, useTheme } from '@/design-system';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { useOnboardingStore } from '@/features/onboarding/store';

export default function Ready() {
  const { spacing, colors } = useTheme();
  const analytics = useAnalytics();
  const profile = useOnboardingStore((s) => s.profile);
  const startedAt = useOnboardingStore((s) => s.startedAt);
  const complete = useOnboardingStore((s) => s.complete);
  const reduce = useReducedMotion();
  const scale = useSharedValue(reduce ? 1 : 0.6);

  useEffect(() => {
    if (!reduce) scale.value = withDelay(200, withSpring(1, spring.bouncy));
  }, [scale, reduce]);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const finish = () => {
    analytics.track('onboarding_completed', {
      duration_ms: startedAt ? Date.now() - startedAt : 0,
      goals: profile.goals,
      days_per_week: profile.daysPerWeek,
    });
    complete();
    router.replace('/(tabs)');
  };

  return (
    <OnboardingShell
      step="ready"
      title={profile.name ? `You're set, ${profile.name}.` : "You're all set."}
      subtitle="Your rings are ready. Close them today and we'll build from there."
      nextLabel="Start today"
      onNext={finish}
    >
      <View style={{ alignItems: 'center', paddingVertical: spacing['6'] }}>
        <Animated.View style={pop}>
          <ProgressRing
            value={1}
            size={180}
            accessibilityLabel="Daily step goal"
            accessibilityValueText={`${profile.targets.steps.toLocaleString()} steps per day`}
          >
            <View style={{ alignItems: 'center' }}>
              <Text variant="metric">{Math.round(profile.targets.steps / 1000)}k</Text>
              <Text variant="label" color="secondary">
                steps / day
              </Text>
            </View>
          </ProgressRing>
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: spacing['6'], marginTop: spacing['6'] }}>
          <View style={{ alignItems: 'center' }}>
            <Text variant="metricSm" color={colors.data.energy}>
              {profile.targets.activeMinutes}
            </Text>
            <Text variant="caption" color="secondary">
              active min
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="metricSm" color={colors.data.hydration}>
              {(profile.targets.waterMl / 1000).toFixed(1)}L
            </Text>
            <Text variant="caption" color="secondary">
              water
            </Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text variant="metricSm" color={colors.data.move}>
              {profile.daysPerWeek}×
            </Text>
            <Text variant="caption" color="secondary">
              per week
            </Text>
          </View>
        </View>
      </View>
    </OnboardingShell>
  );
}
