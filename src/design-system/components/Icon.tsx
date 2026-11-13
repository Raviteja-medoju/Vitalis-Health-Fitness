import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';

export interface IconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  /** Decorative icons are hidden from assistive tech (default). Give a label to expose them. */
  accessibilityLabel?: string;
}

export function Icon({ icon: Glyph, size, color, strokeWidth = 2, accessibilityLabel }: IconProps) {
  const { colors, sizes } = useTheme();
  const decorative = !accessibilityLabel;
  return (
    <View
      accessible={!decorative}
      accessibilityRole={decorative ? undefined : 'image'}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={decorative}
      importantForAccessibility={decorative ? 'no-hide-descendants' : 'yes'}
    >
      <Glyph
        size={size ?? sizes.iconLg}
        color={color ?? colors.fg.primary}
        strokeWidth={strokeWidth}
      />
    </View>
  );
}
