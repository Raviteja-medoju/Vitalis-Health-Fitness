import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { useAnimatedProgress } from '../motion';
import { useTheme } from '../theme/ThemeProvider';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export interface ProgressRingProps {
  /** 0..1 (values above 1 are clamped visually but reported in the a11y value). */
  value: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  /** Required: what the ring measures, e.g. "Steps". */
  accessibilityLabel: string;
  /** Human text for the current value, e.g. "6,420 of 8,000 steps". */
  accessibilityValueText?: string;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ProgressRing({
  value,
  size,
  strokeWidth,
  color,
  trackColor,
  accessibilityLabel,
  accessibilityValueText,
  children,
  style,
}: ProgressRingProps) {
  const { colors, component } = useTheme();
  const s = size ?? component.ring.sizeMd;
  const sw = strokeWidth ?? component.ring.strokeWidth;
  const r = (s - sw) / 2;
  const c = 2 * Math.PI * r;
  const progress = useAnimatedProgress(value);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: c * (1 - progress.value),
  }));

  const pct = Math.round(Math.max(0, value) * 100);

  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{
        min: 0,
        max: 100,
        now: Math.min(pct, 100),
        text: accessibilityValueText,
      }}
      style={[{ width: s, height: s, alignItems: 'center', justifyContent: 'center' }, style]}
    >
      <Svg width={s} height={s} style={{ position: 'absolute', transform: [{ rotate: '-90deg' }] }}>
        <Circle
          cx={s / 2}
          cy={s / 2}
          r={r}
          stroke={trackColor ?? colors.data.track}
          strokeWidth={sw}
          fill="none"
        />
        <AnimatedCircle
          cx={s / 2}
          cy={s / 2}
          r={r}
          stroke={color ?? colors.data.move}
          strokeWidth={sw}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          animatedProps={animatedProps}
        />
      </Svg>
      <View importantForAccessibility="no-hide-descendants" accessibilityElementsHidden>
        {children}
      </View>
    </View>
  );
}
