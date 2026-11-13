import React, { useState } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { enter, usePressScale } from '../motion';
import { useTheme } from '../theme/ThemeProvider';

export interface CardProps extends ViewProps {
  variant?: 'surface' | 'subtle' | 'brand' | 'outline';
  padding?: number;
  elevated?: boolean;
  /** When provided the card becomes a button with press feedback. */
  onPress?: PressableProps['onPress'];
  accessibilityLabel?: string;
  accessibilityHint?: string;
  /** Stagger index for entering animation; omit to disable. */
  enterIndex?: number;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  variant = 'surface',
  padding,
  elevated = false,
  onPress,
  accessibilityLabel,
  accessibilityHint,
  enterIndex,
  style,
  children,
  ...rest
}: CardProps) {
  const { colors, component, elevation } = useTheme();
  const press = usePressScale(0.985);
  const [focused, setFocused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const bg = {
    surface: colors.bg.surface,
    subtle: colors.bg.subtle,
    brand: colors.bg.brandSubtle,
    outline: 'transparent',
  }[variant];

  const base: ViewStyle = {
    backgroundColor: bg,
    borderRadius: component.card.radius,
    borderTopRightRadius: component.card.radius + 8,
    borderBottomLeftRadius: component.card.radius + 8,
    padding: padding ?? component.card.padding,
    borderWidth: 1,
    borderColor: focused
      ? colors.border.focus
      : hovered
        ? colors.border.strong
        : colors.border.default,
    ...(elevated ? elevation.md : {}),
  };

  const entering = enterIndex != null ? enter.fadeUp(enterIndex) : undefined;

  if (onPress) {
    return (
      <AnimatedPressable
        {...rest}
        entering={entering}
        onPress={onPress}
        onPressIn={press.onPressIn}
        onPressOut={press.onPressOut}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onHoverIn={() => setHovered(true)}
        onHoverOut={() => setHovered(false)}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        style={[base, press.style, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  if (entering) {
    return (
      <Animated.View {...rest} entering={entering} style={[base, style]}>
        {children}
      </Animated.View>
    );
  }
  return (
    <View {...rest} style={[base, style]}>
      {children}
    </View>
  );
}
