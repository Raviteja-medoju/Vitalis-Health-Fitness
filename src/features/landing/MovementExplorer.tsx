import { ArrowRight, Clock, Dumbbell } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';

import {
  Button,
  Card,
  SegmentedControl,
  Text,
  useMotionPreference,
  useTheme,
} from '@/design-system';
import { WORKOUTS, type WorkoutCategory } from '@/features/workouts/catalog';
import { WorkoutVisual } from '@/features/workouts/WorkoutVisual';

export function MovementExplorer({ onStart }: { onStart: () => void }) {
  const { colors, compact } = useTheme();
  const reduced = useMotionPreference();
  const [category, setCategory] = useState<WorkoutCategory>('strength');
  const workout = WORKOUTS.find((item) => item.category === category)!;
  return (
    <View style={{ gap: compact ? 16 : 24, paddingBottom: compact ? 32 : 48 }}>
      <View style={{ gap: 12 }}>
        <Text variant="label" color="brand" style={{ letterSpacing: 1.5 }}>
          A LITTLE TIME. A LOT OF POSSIBILITY.
        </Text>
        <Text variant="display" heading={2}>
          Find your kind of movement.
        </Text>
        <Text color="secondary">Explore four ways to make a little room for yourself.</Text>
      </View>
      <SegmentedControl
        accessibilityLabel="Explore movement styles"
        value={category}
        onChange={setCategory}
        options={[
          { value: 'strength', label: 'Strength' },
          { value: 'cardio', label: 'Cardio' },
          { value: 'mobility', label: 'Mobility' },
          { value: 'mindfulness', label: 'Mindfulness' },
        ]}
      />
      <Animated.View layout={reduced ? undefined : LinearTransition.duration(280)}>
        <Card
          padding={20}
          style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 28, alignItems: 'center' }}
        >
          <View style={{ flexGrow: 1, flexShrink: 1, flexBasis: 320, minWidth: 0 }}>
            <Animated.View key={category} entering={reduced ? undefined : FadeIn.duration(300)}>
              <WorkoutVisual category={category} minutes={workout.durationMin} />
            </Animated.View>
          </View>
          <View
            accessibilityLiveRegion="polite"
            style={{ flexGrow: 1, flexShrink: 1, flexBasis: 320, minWidth: 0, gap: 16 }}
          >
            <Text variant="headline" heading={3}>
              {workout.title}
            </Text>
            <Text color="secondary">{workout.summary}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Clock size={16} color={colors.fg.brand} />
                <Text variant="caption" color="secondary">
                  {workout.durationMin} minutes
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}>
                <Dumbbell size={16} color={colors.fg.brand} />
                <Text variant="caption" color="secondary">
                  {workout.equipment === 'none' ? 'No equipment' : workout.equipment}
                </Text>
              </View>
            </View>
            <Button
              label="Build my routine"
              variant="secondary"
              rightIcon={ArrowRight}
              onPress={onStart}
            />
          </View>
        </Card>
      </Animated.View>
    </View>
  );
}
