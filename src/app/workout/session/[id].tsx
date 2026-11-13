import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Check, Pause, Play, SkipForward, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Platform, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { useAnalytics } from '@/analytics';
import {
  Button,
  IconButton,
  ProgressBar,
  ProgressRing,
  Screen,
  Text,
  announce,
  useTheme,
} from '@/design-system';
import { useActivityStore } from '@/features/activity/store';
import { useSettingsStore } from '@/features/profile/settingsStore';
import { workoutById } from '@/features/workouts/catalog';
import { useWorkoutsStore } from '@/features/workouts/store';
import { formatDuration } from '@/lib/date';

/** Guided session player: timer per exercise, pause/skip, completion logging. */
export default function WorkoutSession() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const analytics = useAnalytics();
  const workout = useMemo(() => workoutById(String(id)), [id]);
  const log = useWorkoutsStore((s) => s.log);
  const addActivity = useActivityStore((s) => s.add);

  const [index, setIndex] = useState(0);
  const [remaining, setRemaining] = useState(workout?.exercises[0]?.seconds ?? 0);
  const [running, setRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const loggedRef = useRef(false);

  const ex = workout?.exercises[index];
  const total = workout?.exercises.length ?? 0;
  const isTimed = Boolean(ex?.seconds);

  const finish = useCallback(
    (completionPct: number) => {
      if (!workout || loggedRef.current) return;
      loggedRef.current = true;
      const kcal = Math.round(workout.kcal * completionPct);
      log({
        workoutId: workout.id,
        startedAt: startedAt,
        endedAt: Date.now(),
        elapsedS: elapsed,
        completionPct,
        kcal,
      });
      addActivity({
        activeMinutes: Math.round(elapsed / 60),
        kcalBurned: kcal,
        workoutsCompleted: completionPct >= 0.8 ? 1 : 0,
      });
      if (completionPct >= 0.8) {
        analytics.track('workout_completed', {
          workout_id: workout.id,
          elapsed_s: elapsed,
          completion_pct: completionPct,
        });
        if (useSettingsStore.getState().hapticsEnabled && Platform.OS !== 'web')
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
        announce('Workout complete. Well done.');
        setDone(true);
      } else {
        analytics.track('workout_abandoned', {
          workout_id: workout.id,
          elapsed_s: elapsed,
          completion_pct: completionPct,
        });
        router.back();
      }
    },
    [workout, elapsed, log, addActivity, analytics, startedAt],
  );

  const next = useCallback(() => {
    if (!workout) return;
    if (index + 1 >= total) {
      finish(1);
      return;
    }
    const n = index + 1;
    setIndex(n);
    setRemaining(workout.exercises[n]?.seconds ?? 0);
    announce(`${workout.exercises[n]?.name}. ${workout.exercises[n]?.cue}`);
    if (useSettingsStore.getState().hapticsEnabled && Platform.OS !== 'web')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
  }, [workout, index, total, finish]);

  // Tick
  useEffect(() => {
    if (!running || done) return;
    const t = setInterval(() => {
      setElapsed((e) => e + 1);
      if (isTimed) {
        setRemaining((r) => {
          if (r <= 1) {
            setTimeout(next, 0);
            return 0;
          }
          return r - 1;
        });
      }
    }, 1000);
    return () => clearInterval(t);
  }, [running, done, isTimed, next]);

  if (!workout || !ex) {
    return (
      <Screen>
        <Text>Workout not found.</Text>
      </Screen>
    );
  }

  const progress = (index + (isTimed && ex.seconds ? 1 - remaining / ex.seconds : 0)) / total;

  if (done) {
    return (
      <Screen>
        <Animated.View
          entering={FadeIn.duration(300)}
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing['5'],
            paddingVertical: spacing['12'],
          }}
        >
          <ProgressRing
            value={1}
            size={160}
            color={colors.fg.success}
            accessibilityLabel="Workout complete"
            accessibilityValueText="100 percent"
          >
            <Check size={56} color={colors.fg.success} />
          </ProgressRing>
          <Text variant="title" heading={1} align="center">
            {workout.title} done
          </Text>
          <Text variant="body" color="secondary" align="center">
            {formatDuration(elapsed)} · ~{workout.kcal} kcal · rings updated
          </Text>
          <Button label="Back to Today" size="lg" onPress={() => router.dismissTo('/(tabs)')} />
        </Animated.View>
      </Screen>
    );
  }

  return (
    <Screen
      scroll={false}
      footer={
        <View
          style={{
            flexDirection: 'row',
            gap: spacing['3'],
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconButton
            icon={X}
            accessibilityLabel="End workout"
            variant="tonal"
            onPress={() => {
              analytics.track('workout_paused', { workout_id: workout.id, elapsed_s: elapsed });
              finish(index / total);
            }}
          />
          <Button
            label={running ? 'Pause' : 'Resume'}
            leftIcon={running ? Pause : Play}
            size="lg"
            style={{ flex: 1 }}
            onPress={() => {
              setRunning((r) => !r);
              if (running)
                analytics.track('workout_paused', { workout_id: workout.id, elapsed_s: elapsed });
            }}
          />
          <IconButton
            icon={isTimed ? SkipForward : Check}
            accessibilityLabel={isTimed ? 'Skip exercise' : 'Mark done, next exercise'}
            variant="filled"
            onPress={next}
          />
        </View>
      }
    >
      <View style={{ flex: 1, gap: spacing['5'] }}>
        <View style={{ gap: spacing['1'] }}>
          <ProgressBar value={progress} accessibilityLabel="Workout progress" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text variant="caption" color="muted">
              {index + 1} of {total}
            </Text>
            <Text variant="caption" color="muted">
              {formatDuration(elapsed)} elapsed
            </Text>
          </View>
        </View>

        <Animated.View
          key={ex.id}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(120)}
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing['4'] }}
        >
          <ProgressRing
            value={isTimed && ex.seconds ? remaining / ex.seconds : 1}
            size={220}
            strokeWidth={14}
            accessibilityLabel={`${ex.name} timer`}
            accessibilityValueText={isTimed ? `${remaining} seconds remaining` : `${ex.reps} reps`}
          >
            <View style={{ alignItems: 'center' }}>
              <Text
                variant="metric"
                accessibilityLiveRegion={remaining % 10 === 0 ? 'polite' : 'none'}
              >
                {isTimed ? formatDuration(remaining) : `${ex.reps}`}
              </Text>
              <Text variant="label" color="secondary">
                {isTimed ? 'remaining' : 'reps'}
              </Text>
            </View>
          </ProgressRing>
          <View
            style={{ alignItems: 'center', gap: spacing['1'], paddingHorizontal: spacing['4'] }}
          >
            <Text variant="headline" heading={1} align="center">
              {ex.name}
            </Text>
            <Text variant="body" color="secondary" align="center">
              {ex.cue}
            </Text>
          </View>
          {workout.exercises[index + 1] ? (
            <Text variant="caption" color="muted">
              Up next: {workout.exercises[index + 1]?.name}
            </Text>
          ) : null}
        </Animated.View>
      </View>
    </Screen>
  );
}
