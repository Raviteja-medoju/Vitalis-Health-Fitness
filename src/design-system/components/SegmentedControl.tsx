import React from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';

export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (v: T) => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  style,
}: SegmentedControlProps<T>) {
  const { colors, radii, spacing, sizes } = useTheme();
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={[
        {
          flexDirection: 'row',
          flexWrap: 'wrap',
          backgroundColor: colors.bg.subtle,
          borderRadius: radii.md,
          padding: spacing['1'],
          gap: spacing['1'],
        },
        style,
      ]}
    >
      {options.map((o) => {
        const selected = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityLabel={o.label}
            accessibilityState={{ checked: selected, selected }}
            aria-checked={selected}
            onPress={() => onChange(o.value)}
            style={{
              flex: 1,
              minHeight: sizes.touchTarget,
              minWidth: 64,
              paddingHorizontal: 8,
              paddingVertical: 8,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: radii.sm,
              backgroundColor: selected ? colors.bg.surface : 'transparent',
              borderWidth: 1,
              borderColor: selected ? colors.border.default : 'transparent',
            }}
          >
            <Text variant="label" color={selected ? 'primary' : 'secondary'} align="center">
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
