import { router } from 'expo-router';
import { X } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { View } from 'react-native';

import {
  Card,
  IconButton,
  PageHeader,
  ResponsiveGrid,
  Screen,
  StatTile,
  Text,
  useTheme,
} from '@/design-system';
import { emptyDay, useActivityStore } from '@/features/activity/store';
import { WeeklyBars } from '@/features/insights/WeeklyBars';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useWorkoutsStore } from '@/features/workouts/store';
import { formatNumber, lastNDays, todayKey } from '@/lib/date';

export default function Insights() {
  const { colors, spacing } = useTheme();
  const days = useActivityStore((s) => s.days);
  const day = todayKey();
  const week = useMemo(
    () => lastNDays(7, day).map((key) => ({ day: key, metrics: days[key] ?? emptyDay })),
    [days, day],
  );
  const targets = useOnboardingStore((s) => s.profile.targets);
  const history = useWorkoutsStore((s) => s.history);
  const [now] = useState(() => Date.now());

  const avg = (k: 'steps' | 'activeMinutes' | 'sleepHours' | 'waterMl') =>
    week.reduce((a, d) => a + d.metrics[k], 0) / week.length;
  const daysHit = week.filter((d) => d.metrics.steps >= targets.steps).length;
  const weekWorkouts = history.filter((h) => now - h.endedAt < 7 * 864e5).length;

  return (
    <Screen wide>
      <View style={{ gap: spacing['5'] }}>
        <PageHeader
          title="This week"
          subtitle="A little perspective on your everyday progress."
          action={
            <IconButton
              icon={X}
              accessibilityLabel="Close insights"
              onPress={() => router.back()}
            />
          }
        />

        <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
          <StatTile
            label="Avg steps"
            value={formatNumber(avg('steps'))}
            goalText={`${daysHit}/7 days at goal`}
            color={colors.data.move}
          />
          <StatTile
            label="Workouts"
            value={String(weekWorkouts)}
            goalText="last 7 days"
            color={colors.data.energy}
          />
        </View>

        <ResponsiveGrid minItemWidth={340}>
          <Card>
            <WeeklyBars
              title="Steps"
              unit="steps"
              color={colors.data.move}
              goal={targets.steps}
              data={week.map((d) => ({ day: d.day, value: d.metrics.steps }))}
            />
          </Card>
          <Card>
            <WeeklyBars
              title="Active minutes"
              unit="min"
              color={colors.data.energy}
              goal={targets.activeMinutes}
              data={week.map((d) => ({ day: d.day, value: d.metrics.activeMinutes }))}
            />
          </Card>
          <Card>
            <WeeklyBars
              title="Sleep"
              unit="h"
              color={colors.data.sleep}
              goal={8}
              format={(v) => v.toFixed(1)}
              data={week.map((d) => ({ day: d.day, value: d.metrics.sleepHours }))}
            />
          </Card>
          <Card>
            <WeeklyBars
              title="Water"
              unit="ml"
              color={colors.data.hydration}
              goal={targets.waterMl}
              data={week.map((d) => ({ day: d.day, value: d.metrics.waterMl }))}
            />
          </Card>
        </ResponsiveGrid>
        <Text variant="caption" color="muted">
          Averages: {Math.round(avg('activeMinutes'))} active min · {avg('sleepHours').toFixed(1)} h
          sleep · {formatNumber(avg('waterMl'))} ml water per day.
        </Text>
      </View>
    </Screen>
  );
}
