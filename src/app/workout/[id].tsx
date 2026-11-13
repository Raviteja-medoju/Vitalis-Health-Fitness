import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Clock, Dumbbell, Flame, Play } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { useAnalytics } from '@/analytics';
import { Button, Card, Icon, IconButton, Screen, Text, useTheme } from '@/design-system';
import { workoutById } from '@/features/workouts/catalog';
import { formatDuration } from '@/lib/date';

export default function WorkoutDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing } = useTheme();
  const analytics = useAnalytics();
  const workout = workoutById(String(id));

  if (!workout) {
    return (
      <Screen>
        <Text variant="headline">Workout not found</Text>
        <Button
          label="Back"
          variant="secondary"
          onPress={() => router.back()}
          style={{ marginTop: spacing['4'] }}
        />
      </Screen>
    );
  }

  const start = () => {
    analytics.track('workout_started', {
      workout_id: workout.id,
      duration_min: workout.durationMin,
    });
    router.push({ pathname: '/workout/session/[id]', params: { id: workout.id } });
  };

  const facts = [
    { icon: Clock, text: `${workout.durationMin} min` },
    { icon: Flame, text: `~${workout.kcal} kcal` },
    { icon: Dumbbell, text: workout.equipment === 'none' ? 'No equipment' : workout.equipment },
  ];

  return (
    <Screen
      footer={<Button label="Start workout" size="lg" fullWidth leftIcon={Play} onPress={start} />}
    >
      <View style={{ gap: spacing['5'] }}>
        <IconButton icon={ArrowLeft} accessibilityLabel="Go back" onPress={() => router.back()} />
        <View style={{ gap: spacing['2'] }}>
          <Text
            variant="caption"
            color="brand"
            style={{ textTransform: 'uppercase', letterSpacing: 1 }}
          >
            {workout.category} · {workout.intensity}
          </Text>
          <Text variant="title" heading={1}>
            {workout.title}
          </Text>
          <Text variant="body" color="secondary">
            {workout.summary}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing['4'], flexWrap: 'wrap' }}>
          {facts.map((f) => (
            <View key={f.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Icon icon={f.icon} size={18} color={colors.fg.muted} />
              <Text variant="label" color="secondary">
                {f.text}
              </Text>
            </View>
          ))}
        </View>
        <View style={{ gap: spacing['2'] }}>
          <Text variant="subhead" heading={2}>
            {workout.exercises.length} moves
          </Text>
          <View accessibilityRole="list" style={{ gap: spacing['2'] }}>
            {workout.exercises.map((e, i) => (
              <Card
                key={e.id}
                enterIndex={i}
                style={{ flexDirection: 'row', gap: spacing['3'], alignItems: 'center' }}
              >
                <View
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 16,
                    backgroundColor: colors.bg.subtle,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text variant="label" color="secondary">
                    {i + 1}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodyStrong">{e.name}</Text>
                  <Text variant="caption" color="secondary">
                    {e.cue}
                  </Text>
                </View>
                <Text variant="label" color="muted">
                  {e.seconds ? formatDuration(e.seconds) : `${e.reps} reps`}
                </Text>
              </Card>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}
