import { Bookmark, BookmarkCheck, ChevronDown, ChevronUp, Play } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import { Button, Card, IconButton, Text, useMotionPreference, useTheme } from '@/design-system';
import { DepthSurface } from '@/design-system/motion/DepthSurface';

import type { Workout } from './catalog';
import { useWorkoutsStore } from './store';
import { WorkoutVisual } from './WorkoutVisual';

export function WorkoutLibraryCard({
  workout,
  onOpen,
  completed,
}: {
  workout: Workout;
  onOpen: () => void;
  completed?: number;
}) {
  const { colors } = useTheme();
  const reduced = useMotionPreference();
  const saved = useWorkoutsStore((s) => s.savedIds.includes(workout.id));
  const toggleSaved = useWorkoutsStore((s) => s.toggleSaved);
  const [expanded, setExpanded] = useState(false);
  return (
    <DepthSurface style={{ flex: 1 }}>
      <Animated.View
        layout={reduced ? undefined : LinearTransition.duration(280)}
        style={{ flex: 1 }}
      >
        <Card padding={12} style={{ flex: 1, gap: 16 }}>
          <WorkoutVisual category={workout.category} minutes={workout.durationMin} />
          <View style={{ gap: 12, paddingHorizontal: 6, paddingBottom: 6, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <View style={{ flex: 1, gap: 6 }}>
                <Text
                  variant="caption"
                  color="brand"
                  style={{ textTransform: 'uppercase', letterSpacing: 1 }}
                >
                  {workout.category} · {workout.intensity}
                </Text>
                <Text variant="subhead" heading={3}>
                  {workout.title}
                </Text>
              </View>
              <IconButton
                icon={saved ? BookmarkCheck : Bookmark}
                variant={saved ? 'tonal' : 'plain'}
                accessibilityLabel={`${saved ? 'Unsave' : 'Save'} ${workout.title}`}
                aria-pressed={saved}
                onPress={() => toggleSaved(workout.id)}
              />
            </View>
            <Text variant="label" color="secondary" style={{ fontWeight: '400', flex: 1 }}>
              {workout.summary}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[
                `${workout.exercises.length} exercises`,
                workout.equipment === 'none' ? 'No equipment' : workout.equipment,
                `~${workout.kcal} kcal`,
              ].map((label) => (
                <View
                  key={label}
                  style={{
                    backgroundColor: colors.bg.subtle,
                    borderRadius: 8,
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                  }}
                >
                  <Text variant="caption" color="secondary">
                    {label}
                  </Text>
                </View>
              ))}
            </View>
            {completed ? (
              <Text variant="caption" color="success">
                Last session {new Date(completed).toLocaleDateString()}
              </Text>
            ) : null}
            <Button
              label={expanded ? 'Hide exercises' : 'Preview exercises'}
              variant="ghost"
              rightIcon={expanded ? ChevronUp : ChevronDown}
              accessibilityLabel={`${expanded ? 'Hide' : 'Preview'} exercises for ${workout.title}`}
              accessibilityState={{ expanded }}
              onPress={() => setExpanded((value) => !value)}
            />
            {expanded ? (
              <Animated.View
                entering={reduced ? undefined : FadeIn.duration(240)}
                style={{
                  gap: 12,
                  padding: 12,
                  backgroundColor: colors.bg.subtle,
                  borderRadius: 12,
                }}
              >
                {workout.exercises.map((exercise, index) => (
                  <View key={exercise.id} style={{ flexDirection: 'row', gap: 10 }}>
                    <Text variant="caption" color="brand">
                      {String(index + 1).padStart(2, '0')}
                    </Text>
                    <View style={{ flex: 1 }}>
                      <Text variant="label">{exercise.name}</Text>
                      <Text variant="caption" color="secondary">
                        {exercise.seconds ? `${exercise.seconds}s` : `${exercise.reps} reps`} ·{' '}
                        {exercise.cue}
                      </Text>
                    </View>
                  </View>
                ))}
              </Animated.View>
            ) : null}
            <Button
              label="View workout"
              leftIcon={Play}
              onPress={onOpen}
              accessibilityLabel={`View ${workout.title}`}
              fullWidth
            />
          </View>
        </Card>
      </Animated.View>
    </DepthSurface>
  );
}
