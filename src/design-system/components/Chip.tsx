import * as Haptics from 'expo-haptics';
import type { LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Platform, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated from 'react-native-reanimated';

import { useSettingsStore } from '@/features/profile/settingsStore';

import { usePressScale } from '../motion';
import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  /** 'checkbox' for multi-select groups, 'radio' for single-select, 'button' for actions. */
  role?: 'checkbox' | 'radio' | 'button';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  role = 'checkbox',
  disabled,
  style,
  testID,
}: ChipProps) {
  const { colors, radii, spacing, sizes } = useTheme();
  const press = usePressScale(0.95);
  const [focused, setFocused] = useState(false);
  const hapticsEnabled = useSettingsStore((s) => s.hapticsEnabled);
  const bg = selected ? colors.action.primary : colors.bg.surface;
  const fg = selected ? colors.fg.onBrand : colors.fg.primary;

  return (
    <AnimatedPressable
      testID={testID}
      accessibilityRole={role}
      accessibilityLabel={label}
      accessibilityState={{
        selected,
        checked: role === 'button' ? undefined : selected,
        disabled: Boolean(disabled),
      }}
      disabled={disabled}
      onPress={() => {
        if (hapticsEnabled && Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
        onPress?.();
      }}
      onPressIn={press.onPressIn}
      onPressOut={press.onPressOut}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        {
          minHeight: sizes.touchTarget,
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['2'],
          borderRadius: radii.full,
          backgroundColor: bg,
          borderWidth: 2,
          borderColor: focused
            ? colors.border.focus
            : selected
              ? colors.action.primary
              : colors.border.default,
          flexDirection: 'row',
          alignItems: 'center',
          gap: spacing['2'],
          opacity: disabled ? 0.5 : 1,
          ...(Platform.OS === 'web'
            ? ({ outlineStyle: 'none', cursor: 'pointer' } as object)
            : null),
        },
        press.style,
        style,
      ]}
    >
      {icon ? <Icon icon={icon} size={sizes.iconSm} color={fg} /> : null}
      <Text variant="label" color={fg}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
