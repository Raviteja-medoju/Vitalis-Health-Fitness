import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { useAnimatedProgress } from '../motion';
import { useTheme } from '../theme/ThemeProvider';

export interface ProgressBarProps {
  value: number; // 0..1
  accessibilityLabel: string;
  color?: string;
  height?: number;
  style?: StyleProp<ViewStyle>;
}

export function ProgressBar({
  value,
  accessibilityLabel,
  color,
  height = 6,
  style,
}: ProgressBarProps) {
  const { colors, radii } = useTheme();
  const progress = useAnimatedProgress(value);
  const fill = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: pct }}
      style={[
        {
          height,
          borderRadius: radii.full,
          backgroundColor: colors.data.track,
          overflow: 'hidden',
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          { height, borderRadius: radii.full, backgroundColor: color ?? colors.action.primary },
          fill,
        ]}
      />
    </View>
  );
}
