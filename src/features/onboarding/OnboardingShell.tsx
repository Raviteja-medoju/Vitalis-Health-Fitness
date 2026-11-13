import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useAnalytics, type OnboardingStep } from '@/analytics';
import { Button, IconButton, ProgressBar, Screen, Text, enter, useTheme } from '@/design-system';
import { useExperiment } from '@/experiments';

import { ONBOARDING_STEPS, useOnboardingStore } from './store';

interface Props {
  step: OnboardingStep;
  title: string;
  subtitle?: string;
  /** Primary CTA */
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext: () => void;
  /** Optional skip to reduce drop-off on non-essential steps */
  onSkip?: () => void;
  children: React.ReactNode;
}

/**
 * Shared chrome for onboarding steps: progress, back, skip, CTA, and funnel analytics.
 * Emits step_viewed on mount and step_completed/skipped with the time on step.
 */
export function OnboardingShell({
  step,
  title,
  subtitle,
  nextLabel = 'Continue',
  nextDisabled,
  onNext,
  onSkip,
  children,
}: Props) {
  const { spacing } = useTheme();
  const analytics = useAnalytics();
  const start = useOnboardingStore((s) => s.start);
  const variant = useExperiment('onboarding_progress_copy');
  const index = ONBOARDING_STEPS.indexOf(step);
  const total = ONBOARDING_STEPS.length;
  const timer = useRef<() => number>(() => 0);

  useEffect(() => {
    start();
    timer.current = analytics.startTimer();
    analytics.track('onboarding_step_viewed', { step, index, total });
  }, [analytics, step, index, total, start]);

  const complete = () => {
    analytics.track('onboarding_step_completed', { step, index, duration_ms: timer.current() });
    onNext();
  };
  const skip = () => {
    analytics.track('onboarding_step_skipped', { step, index });
    onSkip?.();
  };

  const minutesLeft = Math.max(1, Math.ceil(((total - index) * 15) / 60));
  const progressCopy =
    variant === 'time_estimate' ? `About ${minutesLeft} min left` : `Step ${index + 1} of ${total}`;

  return (
    <Screen
      scroll
      footer={
        <View style={{ gap: spacing['2'] }}>
          <Button
            label={nextLabel}
            fullWidth
            size="lg"
            onPress={complete}
            disabled={nextDisabled}
          />
          {onSkip ? <Button label="Skip for now" variant="ghost" fullWidth onPress={skip} /> : null}
        </View>
      }
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['3'],
          marginBottom: spacing['4'],
        }}
      >
        {index > 0 ? (
          <IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={() => router.back()} />
        ) : (
          <View style={{ width: 44 }} />
        )}
        <View style={{ flex: 1, gap: spacing['1'] }}>
          <ProgressBar value={(index + 1) / total} accessibilityLabel="Onboarding progress" />
          <Text variant="caption" color="muted" align="center">
            {progressCopy}
          </Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <Animated.View
        entering={enter.fadeUp(0)}
        style={{ gap: spacing['2'], marginBottom: spacing['6'] }}
      >
        <Text variant="title" heading={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="body" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </Animated.View>

      <Animated.View entering={enter.fadeUp(1)} style={{ gap: spacing['4'] }}>
        {children}
      </Animated.View>
    </Screen>
  );
}
