import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text, useTheme } from '@/design-system';

import type { WorkoutCategory } from './catalog';

const LABELS = {
  strength: 'BUILD STRENGTH',
  cardio: 'FIND YOUR ENERGY',
  mobility: 'MAKE SOME SPACE',
  mindfulness: 'TAKE A BREATH',
};

/** Lightweight vector artwork shared by the library and today's spotlight. */
export function WorkoutVisual({
  category,
  minutes,
}: {
  category: WorkoutCategory;
  minutes: number;
}) {
  const { colors, compact } = useTheme();
  const palette = {
    background: colors.artwork[`${category}Bg`],
    ink: colors.artwork[`${category}Ink`],
    label: LABELS[category],
  };
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      aria-hidden
      style={{ backgroundColor: palette.background, borderRadius: 20, overflow: 'hidden' }}
    >
      <Svg
        width="100%"
        height={compact ? 120 : 150}
        viewBox="0 0 320 150"
        preserveAspectRatio="xMidYMid slice"
      >
        <Path
          d="M169 150C149 121 166 89 179 59C197 18 239-9 274 8C310 27 297 60 326 79L328 153Z"
          fill={palette.ink}
          opacity={0.1}
        />
        <Circle cx={272} cy={37} r={42} fill={palette.ink} opacity={0.1} />
        <Path
          d="M167 132C170 77 204 23 255 3 M176 137C181 77 212 29 265 7 M185 142C193 83 220 36 275 12"
          stroke={palette.ink}
          strokeWidth={0.8}
          fill="none"
          opacity={0.3}
        />
        <Path
          d="M286 140L314 112 M293 140L314 119 M300 140L314 126 M307 140L314 133"
          stroke={palette.ink}
          strokeWidth={1}
          opacity={0.4}
        />
        {Array.from({ length: 12 }, (_, index) => (
          <Circle
            key={index}
            cx={162 + ((index * 31) % 150)}
            cy={10 + ((index * 43) % 128)}
            r={0.8}
            fill={palette.ink}
            opacity={0.4}
          />
        ))}
        {category === 'strength' ? (
          <Path
            d="M202 109L278 33 M193 91L220 118 M185 99L212 126 M260 24L287 51 M268 16L295 43"
            stroke={palette.ink}
            strokeWidth={9}
            strokeLinecap="round"
          />
        ) : category === 'cardio' ? (
          <>
            <Circle cx={260} cy={30} r={10} fill={palette.ink} />
            <Path
              d="M254 51L234 79L262 94L254 126 M234 79L214 111L189 114 M250 56L275 72L295 60 M246 52L225 48L208 66"
              fill="none"
              stroke={palette.ink}
              strokeWidth={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : category === 'mobility' ? (
          <>
            <Circle cx={250} cy={40} r={10} fill={palette.ink} />
            <Path
              d="M249 63L232 94L198 120 M232 94L268 99L289 122 M247 68L278 49L285 24 M247 68L216 63L201 42 M185 134H300"
              fill="none"
              stroke={palette.ink}
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        ) : (
          <>
            <Path
              d="M245 115C195 96 191 61 212 54C230 47 245 74 245 115Z M245 115C295 96 299 61 278 54C260 47 245 74 245 115Z M245 115C218 75 222 39 245 24C268 39 272 75 245 115Z"
              fill="none"
              stroke={palette.ink}
              strokeWidth={3}
            />
            <Path d="M200 128H290" stroke={palette.ink} strokeWidth={3} strokeLinecap="round" />
          </>
        )}
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: compact ? 12 : 18,
          left: compact ? 12 : 18,
          maxWidth: 150,
          gap: compact ? 8 : 12,
        }}
      >
        <Text variant="caption" color={palette.ink} style={{ letterSpacing: 1.4 }}>
          {palette.label}
        </Text>
        <View>
          <Text variant="display" color={colors.artwork.text}>
            {minutes}
          </Text>
          <Text variant="caption" color={palette.ink}>
            MINUTE RESET
          </Text>
        </View>
      </View>
    </View>
  );
}
