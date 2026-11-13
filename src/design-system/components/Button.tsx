import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  View,
  type GestureResponderEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';

import { useSettingsStore } from '@/features/profile/settingsStore';

import { usePressScale } from '../motion';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends Omit<PressableProps, 'style' | 'children'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  haptic?: boolean;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  haptic = true,
  disabled,
  onPress,
  style,
  accessibilityLabel,
  accessibilityHint,
  accessibilityState,
  ...rest
}: ButtonProps) {
  const { colors, component, spacing, sizes } = useTheme();
  const press = usePressScale(0.97);
  const [focused, setFocused] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const isDisabled = Boolean(disabled) || loading;

  const height =
    size === 'sm'
      ? component.button.heightSm
      : size === 'lg'
        ? component.button.heightLg
        : component.button.heightMd;

  const palette = {
    primary: {
      bg: colors.action.primary,
      pressed: colors.action.primaryPressed,
      fg: colors.fg.onBrand,
      border: 'transparent',
    },
    secondary: {
      bg: colors.action.secondary,
      pressed: colors.action.secondaryPressed,
      fg: colors.fg.brand,
      border: 'transparent',
    },
    ghost: {
      bg: 'transparent',
      pressed: colors.bg.subtle,
      fg: colors.fg.brand,
      border: 'transparent',
    },
    danger: {
      bg: colors.action.danger,
      pressed: colors.action.danger,
      fg: colors.fg.onBrand,
      border: 'transparent',
    },
  }[variant];

  const fg = isDisabled ? colors.action.disabledFg : palette.fg;

  const handlePress = (e: GestureResponderEvent) => {
    if (haptic && hapticsEnabled && Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
    onPress?.(e);
  };

  return (
    <AnimatedPressable
      {...rest}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ ...accessibilityState, disabled: isDisabled, busy: loading }}
      aria-expanded={rest['aria-expanded'] ?? accessibilityState?.expanded}
      disabled={isDisabled}
      onPress={handlePress}
      onPressIn={() => {
        setPressed(true);
        press.onPressIn();
      }}
      onPressOut={() => {
        setPressed(false);
        press.onPressOut();
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      hitSlop={size === 'sm' ? 4 : 0}
      style={[
        {
          minHeight: height,
          paddingVertical: spacing['2'],
          minWidth: sizes.touchTarget,
          paddingHorizontal: component.button.paddingX,
          borderRadius: component.button.radius,
          backgroundColor: isDisabled
            ? variant === 'ghost'
              ? 'transparent'
              : colors.action.disabledBg
            : pressed || hovered
              ? palette.pressed
              : palette.bg,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: spacing['2'],
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          borderWidth: 2,
          borderColor: focused ? colors.border.focus : 'transparent',
          ...(Platform.OS === 'web'
            ? ({ outlineStyle: 'none', cursor: isDisabled ? 'not-allowed' : 'pointer' } as object)
            : null),
        },
        press.style,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} accessibilityLabel="Loading" />
      ) : (
        <>
          {leftIcon ? <Icon icon={leftIcon} size={sizes.iconMd} color={fg} /> : null}
          <Text
            variant={size === 'sm' ? 'label' : 'bodyStrong'}
            color={fg}
            style={{ flexShrink: 1 }}
          >
            {label}
          </Text>
          {rightIcon ? <Icon icon={rightIcon} size={sizes.iconMd} color={fg} /> : null}
        </>
      )}
      {/* Keeps layout stable when toggling loading */}
      {loading ? <View style={{ width: 0, height: 0 }} /> : null}
    </AnimatedPressable>
  );
}
