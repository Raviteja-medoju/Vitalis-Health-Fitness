import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Card, type CardProps } from './Card';
import { Icon } from './Icon';
import { ProgressBar } from './ProgressBar';
import { Text } from './Text';

export interface StatTileProps extends Omit<CardProps, 'children'> {
  label: string;
  value: string;
  unit?: string;
  icon?: LucideIcon;
  color?: string;
  /** Optional 0..1 progress toward a goal. */
  progress?: number;
  goalText?: string;
}

export function StatTile({
  label,
  value,
  unit,
  icon,
  color,
  progress,
  goalText,
  style,
  ...rest
}: StatTileProps) {
  const { colors, spacing, sizes } = useTheme();
  const accent = color ?? colors.fg.brand;
  const a11y = `${label}: ${value}${unit ? ` ${unit}` : ''}${goalText ? `, ${goalText}` : ''}`;

  return (
    <Card
      {...rest}
      accessible={!rest.onPress}
      accessibilityLabel={rest.accessibilityLabel ?? a11y}
      style={[{ gap: spacing['2'], minWidth: 0, flex: 1 }, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
        {icon ? <Icon icon={icon} size={sizes.iconMd} color={accent} /> : null}
        <Text variant="label" color="secondary">
          {label}
        </Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'baseline',
          gap: spacing['1'],
        }}
      >
        <Text variant="metricSm">{value}</Text>
        {unit ? (
          <Text variant="caption" color="muted">
            {unit}
          </Text>
        ) : null}
      </View>
      {progress != null ? (
        <ProgressBar value={progress} color={accent} accessibilityLabel={`${label} progress`} />
      ) : null}
      {goalText ? (
        <Text variant="caption" color="muted">
          {goalText}
        </Text>
      ) : null}
    </Card>
  );
}
