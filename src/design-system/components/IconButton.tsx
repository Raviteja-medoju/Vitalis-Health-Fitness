import type { LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { MIN_TOUCH } from '../a11y';
import { usePressScale } from '../motion';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';

export interface IconButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  icon: LucideIcon;
  /** Required: icon-only controls must have a name (WCAG 4.1.2). */
  accessibilityLabel: string;
  size?: number;
  color?: string;
  variant?: 'plain' | 'filled' | 'tonal';
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function IconButton({
  icon,
  accessibilityLabel,
  size,
  color,
  variant = 'plain',
  style,
  disabled,
  ...rest
}: IconButtonProps) {
  const { colors, radii, sizes } = useTheme();
  const press = usePressScale(0.92);
  const [focused, setFocused] = useState(false);
  const bg =
    variant === 'filled'
      ? colors.action.primary
      : variant === 'tonal'
        ? colors.action.secondary
        : 'transparent';
  const fg =
    color ??
    (variant === 'filled'
      ? colors.fg.onBrand
      : variant === 'tonal'
        ? colors.fg.brand
        : colors.fg.primary);

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: Boolean(disabled) }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          width: MIN_TOUCH,
          height: MIN_TOUCH,
          borderRadius: radii.full,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: bg,
          opacity: disabled ? 0.5 : 1,
          borderWidth: 2,
          borderColor: focused ? colors.border.focus : 'transparent',
          ...(Platform.OS === 'web'
            ? ({ outlineStyle: 'none', cursor: 'pointer' } as object)
            : null),
        },
        press.style,
        style,
      ]}
    >
      <Icon icon={icon} size={size ?? sizes.iconLg} color={fg} />
    </AnimatedPressable>
  );
}
