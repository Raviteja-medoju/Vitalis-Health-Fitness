import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useTheme } from '@/design-system';

/** Flat paper shapes and botanical ink, drawn as vectors for every screen size. */
export function BotanicalBackdrop() {
  const { colors } = useTheme();
  const ink = colors.illustration;
  return (
    <View
      pointerEvents="none"
      aria-hidden
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden',
        borderRadius: 32,
      }}
    >
      <Svg width="100%" height="100%" viewBox="0 0 480 660" preserveAspectRatio="xMidYMid slice">
        <Path
          d="M-35 210C-10 60 70-45 195 7C315 55 227 157 260 280L173 580L-30 660Z"
          fill={ink.paper}
        />
        <Circle cx={410} cy={85} r={105} fill={ink.ochre} opacity={0.6} />
        <Path
          d="M290 660C245 570 350 475 408 492C500 520 511 600 495 680Z"
          fill={ink.clay}
          opacity={0.6}
        />
        <Path
          d="M420 610C440 485 402 379 449 264 M432 517C380 501 366 478 369 445C411 448 438 479 432 517Z M433 442C470 432 490 406 484 375C446 381 427 410 433 442Z M427 371C398 351 391 327 404 302C430 320 438 342 427 371Z"
          fill="none"
          stroke={ink.line}
          strokeWidth={2}
          opacity={0.55}
        />
        <Path
          d="M24 56L56 25 M24 72L72 25 M24 88L88 25 M24 104L104 25"
          stroke={ink.clay}
          strokeWidth={1.5}
          opacity={0.7}
        />
        {Array.from({ length: 18 }, (_, i) => (
          <Circle
            key={i}
            cx={28 + ((i * 37) % 420)}
            cy={14 + ((i * 73) % 630)}
            r={1.2}
            fill={ink.line}
            opacity={0.16}
          />
        ))}
      </Svg>
    </View>
  );
}
