import React, { Children } from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { useMotionPreference } from '../motion';

/** Wraps according to available container space, including inside a navigation rail. */
export function ResponsiveGrid({
  children,
  minItemWidth = 300,
  gap = 20,
  animate = false,
  style,
  ...rest
}: ViewProps & { minItemWidth?: number; gap?: number; animate?: boolean }) {
  const reduced = useMotionPreference();
  return (
    <View
      {...rest}
      style={[{ flexDirection: 'row', flexWrap: 'wrap', gap, alignItems: 'stretch' }, style]}
    >
      {Children.toArray(children).map((child, index) => (
        <Animated.View
          key={React.isValidElement(child) ? (child.key ?? index) : index}
          layout={animate && !reduced ? LinearTransition.duration(280) : undefined}
          entering={animate && !reduced ? FadeIn.duration(220) : undefined}
          style={{ flexBasis: minItemWidth, flexGrow: 1, flexShrink: 1, minWidth: 0 }}
        >
          {child}
        </Animated.View>
      ))}
    </View>
  );
}
