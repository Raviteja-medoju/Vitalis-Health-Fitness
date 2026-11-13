import { ArrowRight, Check, Droplets, Moon, Sparkles } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import {
  Button,
  Card,
  SegmentedControl,
  Text,
  timing,
  useMotionPreference,
  useTheme,
} from '@/design-system';
import { DepthSurface } from '@/design-system/motion/DepthSurface';
import { WorkoutVisual } from '@/features/workouts/WorkoutVisual';

const CHAPTERS = {
  move: {
    number: '01',
    title: 'Find your momentum.',
    body: 'A short session. A little more energy. Discover movement that fits the time you actually have.',
  },
  nourish: {
    number: '02',
    title: 'Make room for balance.',
    body: 'Keep meals and hydration in view. Small, repeatable habits make your day feel more intentional.',
  },
  recover: {
    number: '03',
    title: 'Give yourself space.',
    body: 'Slow down, take a breath, and make recovery part of your routine. Your quieter moments count, too.',
  },
};
type Chapter = keyof typeof CHAPTERS;

export function WellnessStory({ onStart }: { onStart: () => void }) {
  const { colors, elevation, compact } = useTheme();
  const reduced = useMotionPreference();
  const [chapter, setChapter] = useState<Chapter>('move');
  const phase = useSharedValue(1);
  useEffect(() => {
    if (reduced) {
      phase.value = 1;
      return;
    }
    phase.value = 0;
    phase.value = withTiming(1, timing.slower);
  }, [chapter, reduced, phase]);
  const turn = useAnimatedStyle(
    () => ({
      opacity: reduced ? 1 : 0.65 + phase.value * 0.35,
      transform: reduced
        ? []
        : [
            { perspective: 1200 },
            { rotateY: `${(1 - phase.value) * -12}deg` },
            { translateY: (1 - phase.value) * 16 },
          ],
    }),
    [reduced],
  );
  const current = CHAPTERS[chapter];
  return (
    <View style={{ gap: compact ? 20 : 28, paddingVertical: compact ? 28 : 40 }}>
      <View style={{ gap: 12, alignItems: 'center' }}>
        <Text variant="label" color="brand" style={{ letterSpacing: 1.5 }}>
          ONE DAY. THREE WAYS TO FEEL BETTER.
        </Text>
        <Text variant="display" heading={2} align="center">
          A little more in balance.
        </Text>
      </View>
      <SegmentedControl
        accessibilityLabel="Explore your daily rhythm"
        value={chapter}
        onChange={setChapter}
        options={[
          { value: 'move', label: 'Move' },
          { value: 'nourish', label: 'Nourish' },
          { value: 'recover', label: 'Recover' },
        ]}
        style={{ width: '100%', maxWidth: 440, alignSelf: 'center' }}
      />
      <View
        style={{
          backgroundColor: colors.artwork.strengthBg,
          borderRadius: compact ? 24 : 32,
          padding: compact ? 16 : 24,
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: compact ? 20 : 32,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 280,
            minWidth: 0,
            gap: compact ? 16 : 24,
          }}
        >
          <Text variant="label" color={colors.artwork.strengthInk}>
            THE DAILY EDIT / {current.number}
          </Text>
          <View accessibilityLiveRegion="polite" style={{ gap: 16 }}>
            <Text variant="display" heading={3} color={colors.artwork.text}>
              {current.title}
            </Text>
            <Text color={colors.artwork.strengthInk}>{current.body}</Text>
          </View>
          <Button
            label="Find my rhythm"
            variant="secondary"
            rightIcon={ArrowRight}
            onPress={onStart}
          />
        </View>
        <View
          style={{
            flexGrow: 1,
            flexShrink: 1,
            flexBasis: 320,
            minWidth: 0,
            padding: compact ? 0 : 12,
          }}
        >
          <View
            pointerEvents="none"
            aria-hidden
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              position: 'absolute',
              top: 8,
              bottom: 8,
              left: 12,
              right: 12,
              borderRadius: 24,
              backgroundColor: colors.artwork.strengthInk,
              opacity: 0.16,
              transform: [{ rotate: reduced ? '0deg' : '-4deg' }],
            }}
          />
          <DepthSurface>
            <Animated.View testID="wellness-chapter" style={turn}>
              <Card
                padding={compact ? 14 : 20}
                style={[
                  {
                    gap: compact ? 14 : 20,
                    minHeight: compact ? 250 : 310,
                    justifyContent: 'center',
                  },
                  elevation.md,
                ]}
              >
                {chapter === 'move' ? (
                  <>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Sparkles size={18} color={colors.fg.brand} />
                      <Text variant="label" color="brand">
                        A moment for movement
                      </Text>
                    </View>
                    <WorkoutVisual category="strength" minutes={10} />
                    <Text variant="subhead">10-min Core Reset</Text>
                    <Text variant="caption" color="secondary">
                      A guided session, ready when you are.
                    </Text>
                  </>
                ) : chapter === 'nourish' ? (
                  <>
                    <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                      <Droplets size={20} color={colors.data.hydration} />
                      <Text variant="subhead">Nourish your day</Text>
                    </View>
                    {[
                      ['Oatmeal & berries', '320 kcal'],
                      ['Chicken salad', '420 kcal'],
                      ['Banana', '105 kcal'],
                    ].map(([name, value]) => (
                      <View
                        key={name}
                        style={{
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          justifyContent: 'space-between',
                          gap: 8,
                          paddingVertical: 10,
                          borderBottomWidth: 1,
                          borderColor: colors.border.default,
                        }}
                      >
                        <Text variant="label">{name}</Text>
                        <Text variant="caption" color="secondary">
                          {value}
                        </Text>
                      </View>
                    ))}
                    <Text variant="label" color="brand">
                      One meal. One glass. One small win.
                    </Text>
                  </>
                ) : (
                  <>
                    <View style={{ alignItems: 'center', gap: 20 }}>
                      <View
                        style={{
                          padding: 24,
                          borderRadius: 999,
                          backgroundColor: colors.bg.brandSubtle,
                        }}
                      >
                        <Moon size={44} color={colors.fg.brand} />
                      </View>
                      <Text variant="headline" align="center">
                        Take a slower moment.
                      </Text>
                      <Text align="center" color="secondary">
                        Five minutes of box breathing. A calmer way to close your day.
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                        <Check size={18} color={colors.fg.brand} />
                        <Text variant="caption" color="brand">
                          No equipment. Just you.
                        </Text>
                      </View>
                    </View>
                  </>
                )}
              </Card>
            </Animated.View>
          </DepthSurface>
          <Text
            variant="caption"
            color={colors.artwork.strengthInk}
            align="center"
            style={{ marginTop: 20 }}
          >
            A preview of your routine · sample content
          </Text>
        </View>
      </View>
    </View>
  );
}
