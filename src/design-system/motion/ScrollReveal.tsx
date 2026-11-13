import React from 'react';
import { type ViewProps } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

import { useMotionPreference } from './index';

/** Use as a direct child of the scroll content so its layout Y matches scrollY. */
export function ScrollReveal({
  scrollY,
  viewportHeight,
  children,
  style,
  onLayout,
  ...rest
}: ViewProps & { scrollY: SharedValue<number>; viewportHeight: number }) {
  const reduced = useMotionPreference();
  const top = useSharedValue(0);
  const animated = useAnimatedStyle(() => {
    const progress = reduced
      ? 1
      : interpolate(
          scrollY.value + viewportHeight,
          [top.value + 32, top.value + 210],
          [0, 1],
          Extrapolation.CLAMP,
        );
    return {
      opacity: 0.3 + progress * 0.7,
      transform: reduced
        ? []
        : [
            { perspective: 1200 },
            { translateY: (1 - progress) * 28 },
            { rotateX: `${(1 - progress) * 3}deg` },
          ],
    };
  }, [reduced, viewportHeight]);
  return (
    <Animated.View
      {...rest}
      onLayout={(event) => {
        top.value = event.nativeEvent.layout.y;
        onLayout?.(event);
      }}
      style={[style, animated]}
    >
      {children}
    </Animated.View>
  );
}
