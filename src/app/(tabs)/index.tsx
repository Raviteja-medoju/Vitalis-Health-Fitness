import { router } from 'expo-router';
import { BarChart3, Droplets, Flame, Moon, Play, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { useAnalytics } from '@/analytics';
import {
  Button,
  ActionNotice,
  Card,
  Icon,
  PageHeader,
  ResponsiveGrid,
  Screen,
  StatTile,
  Text,
  announce,
  enter,
  useTheme,
} from '@/design-system';
import { useExperiment } from '@/experiments';
import { RingsHero } from '@/features/activity/RingsHero';
import { ActivityWeek } from '@/features/activity/ActivityWeek';
import { DailyPlan } from '@/features/activity/DailyPlan';
import { useActivityStore } from '@/features/activity/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { recommendWorkouts } from '@/features/workouts/catalog';
import { useWorkoutsStore } from '@/features/workouts/store';
import { WorkoutVisual } from '@/features/workouts/WorkoutVisual';
import { greetingFor } from '@/lib/date';

export default function Today() {
  const { colors, spacing } = useTheme();
  const analytics = useAnalytics();
  const profile = useOnboardingStore((s) => s.profile);
  const today = useActivityStore((s) => s.get());
  const add = useActivityStore((s) => s.add);
  const streak = useWorkoutsStore((s) => s.streakDays());
  const cta = useExperiment('today_primary_cta');
  const [featured, ...more] = recommendWorkouts(profile.goals);
  const [notice, setNotice] = useState<string | null>(null);

  const stepsReached = today.steps >= profile.targets.steps;
  useEffect(() => {
    if (stepsReached) announce('Step goal reached. Great job.');
  }, [stepsReached]);

  const ctaLabel =
    cta === 'start_now'
      ? 'Start now'
      : cta === 'minutes_left'
        ? `${Math.max(0, profile.targets.activeMinutes - today.activeMinutes)} active min to go`
        : 'Start workout';

  const logWater = (ml: number) => {
    add({ waterMl: ml });
    const total = today.waterMl + ml;
    analytics.track('water_logged', { amount_ml: ml, total_ml: total });
    announce(`Logged ${ml} millilitres. ${total} of ${profile.targets.waterMl} today.`);
    setNotice(`${ml} ml logged. You’re at ${(total / 1000).toFixed(2)} L today.`);
    if (today.waterMl < profile.targets.waterMl && total >= profile.targets.waterMl) {
      analytics.track('goal_reached', {
        metric: 'water',
        value: total,
        goal: profile.targets.waterMl,
      });
    }
  };

  return (
    <Screen wide>
      <View style={{ gap: spacing['5'] }}>
        <PageHeader
          title="Make today feel good."
          eyebrow={`${greetingFor()}${profile.name ? `, ${profile.name}` : ''}`}
          subtitle="Your daily rhythm, one small win at a time."
          action={
            streak > 0 ? (
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: colors.bg.accentSubtle,
                  padding: 12,
                  borderRadius: 16,
                }}
              >
                <Flame size={20} color={colors.fg.accent} />
                <Text variant="label" color="accent">
                  {streak} day streak
                </Text>
              </View>
            ) : (
              <Button
                label="Weekly insights"
                variant="secondary"
                leftIcon={BarChart3}
                onPress={() => router.push('/insights')}
              />
            )
          }
        />
        {notice ? <ActionNotice message={notice} onDismiss={() => setNotice(null)} /> : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          <Animated.View
            entering={enter.fadeUp(1)}
            style={{ flexGrow: 1.4, flexShrink: 1, flexBasis: 380, minWidth: 0, gap: 12 }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text variant="subhead" heading={2}>
                Your daily snapshot
              </Text>
              <Text variant="caption" color="brand">
                TODAY
              </Text>
            </View>
            <RingsHero metrics={today} targets={profile.targets} />
          </Animated.View>

          {featured ? (
            <Card
              variant="surface"
              enterIndex={2}
              style={{ flexGrow: 1, flexShrink: 1, flexBasis: 300, minWidth: 0, gap: spacing['4'] }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
                <Icon icon={Sparkles} size={18} color={colors.fg.brand} />
                <Text variant="label" color="brand">
                  Recommended for you
                </Text>
              </View>
              <WorkoutVisual category={featured.category} minutes={featured.durationMin} />
              <View>
                <Text variant="headline" heading={2}>
                  {featured.title}
                </Text>
                <Text variant="label" color="secondary" style={{ fontWeight: '400' }}>
                  {featured.durationMin} min · {featured.intensity} intensity · ~{featured.kcal}{' '}
                  kcal
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: spacing['2'], flexWrap: 'wrap' }}>
                <Button
                  label={ctaLabel}
                  leftIcon={Play}
                  onPress={() => {
                    analytics.track('workout_viewed', { workout_id: featured.id, source: 'today' });
                    router.push({ pathname: '/workout/[id]', params: { id: featured.id } });
                  }}
                />
                <Button
                  label="Ask coach"
                  variant="secondary"
                  onPress={() => {
                    analytics.track('coach_opened', { source: 'today_card' });
                    router.push('/(tabs)/coach');
                  }}
                />
              </View>
            </Card>
          ) : null}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
          <View style={{ flexGrow: 1.4, flexShrink: 1, flexBasis: 380, minWidth: 0 }}>
            <ActivityWeek />
          </View>
          <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 300, minWidth: 0 }}>
            <DailyPlan onWater={() => logWater(250)} />
          </View>
        </View>

        <Animated.View
          entering={enter.fadeUp(3)}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['3'] }}
        >
          <StatTile
            label="Water"
            icon={Droplets}
            color={colors.data.hydration}
            value={(today.waterMl / 1000).toFixed(1)}
            unit="L"
            progress={today.waterMl / profile.targets.waterMl}
            goalText={`Tap to add 250 ml · Goal ${(profile.targets.waterMl / 1000).toFixed(1)} L`}
            style={{ flexBasis: 180 }}
            onPress={() => logWater(250)}
            accessibilityLabel={`Water: ${today.waterMl} of ${profile.targets.waterMl} millilitres. Double tap to log 250 millilitres.`}
          />
          <StatTile
            label="Sleep"
            icon={Moon}
            color={colors.data.sleep}
            value={today.sleepHours ? today.sleepHours.toFixed(1) : '–'}
            unit="h"
            progress={today.sleepHours / 8}
            goalText="Goal 8 h"
            style={{ flexBasis: 180 }}
          />
        </Animated.View>

        {more.length ? (
          <Animated.View entering={enter.fadeUp(4)} style={{ gap: spacing['2'] }}>
            <Text variant="subhead" heading={2}>
              More for your goals
            </Text>
            <ResponsiveGrid minItemWidth={280}>
              {more.map((w, i) => (
                <Card
                  key={w.id}
                  enterIndex={5 + i}
                  onPress={() => {
                    analytics.track('workout_viewed', { workout_id: w.id, source: 'today' });
                    router.push({ pathname: '/workout/[id]', params: { id: w.id } });
                  }}
                  accessibilityLabel={`${w.title}, ${w.durationMin} minutes, ${w.intensity} intensity`}
                  accessibilityHint="Opens workout details"
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['3'] }}
                >
                  <View style={{ flex: 1 }}>
                    <Text variant="bodyStrong">{w.title}</Text>
                    <Text variant="caption" color="secondary">
                      {w.durationMin} min · {w.category}
                    </Text>
                  </View>
                  <Icon icon={Play} size={20} color={colors.fg.brand} />
                </Card>
              ))}
            </ResponsiveGrid>
          </Animated.View>
        ) : null}

        {streak > 0 ? (
          <Button
            label="Weekly insights"
            variant="ghost"
            leftIcon={BarChart3}
            onPress={() => router.push('/insights')}
          />
        ) : null}
      </View>
    </Screen>
  );
}
