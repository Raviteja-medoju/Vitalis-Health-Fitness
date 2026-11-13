import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '../theme/ThemeProvider';

/** A decorative ink sprig. Kept out of the accessibility tree. */
export function BotanicalMark({ size = 48 }: { size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: size, height: size }}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
        <Circle cx={45} cy={17} r={11} fill={colors.bg.accentSubtle} />
        <Path
          d="M18 56C26 44 35 29 42 8 M27 42C15 40 10 33 10 25C23 25 30 31 27 42Z M33 31C42 32 51 26 54 18C42 15 35 22 33 31Z M37 20C28 17 25 10 27 4C37 6 41 12 37 20Z M20 53C33 55 43 51 47 43C34 37 24 44 20 53Z"
          stroke={colors.fg.brand}
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
