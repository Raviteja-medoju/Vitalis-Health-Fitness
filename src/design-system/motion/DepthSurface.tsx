import React, { useEffect, useRef } from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { spring, useMotionPreference } from './index';

/** Pointer-driven perspective without taking over touch scrolling or child buttons. */
export function DepthSurface({ children, style, ...rest }: ViewProps) {
  const reduced = useMotionPreference();
  const host = useRef<React.ComponentRef<typeof View>>(null);
  const bounds = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const lift = useSharedValue(0);
  useEffect(() => {
    if (reduced) {
      x.value = 0;
      y.value = 0;
      lift.value = 0;
    }
  }, [reduced, x, y, lift]);
  const reset = () => {
    x.value = withSpring(0, spring.gentle);
    y.value = withSpring(0, spring.gentle);
    lift.value = withSpring(0, spring.gentle);
  };
  const animated = useAnimatedStyle(
    () => ({
      transform: reduced
        ? []
        : [
            { perspective: 1100 },
            { rotateX: `${x.value}deg` },
            { rotateY: `${y.value}deg` },
            { translateY: lift.value },
          ],
    }),
    [reduced],
  );
  return (
    <View
      {...rest}
      ref={host}
      style={style}
      onPointerEnter={(event) => {
        if (Platform.OS !== 'web' || reduced || event.nativeEvent.pointerType !== 'mouse') return;
        host.current?.measureInWindow((bx, by, width, height) => {
          bounds.current = { x: bx, y: by, width, height };
        });
        lift.value = withSpring(-4, spring.gentle);
      }}
      onPointerMove={(event) => {
        if (Platform.OS !== 'web' || reduced || event.nativeEvent.pointerType !== 'mouse') return;
        const b = bounds.current;
        if (!b.width || !b.height) return;
        const px = Math.max(
          -1,
          Math.min(1, ((event.nativeEvent.clientX - b.x) / b.width - 0.5) * 2),
        );
        const py = Math.max(
          -1,
          Math.min(1, ((event.nativeEvent.clientY - b.y) / b.height - 0.5) * 2),
        );
        x.value = withSpring(-py * 3, spring.gentle);
        y.value = withSpring(px * 3, spring.gentle);
      }}
      onPointerLeave={reset}
      onPointerCancel={reset}
    >
      <Animated.View testID="depth-surface" style={[{ flex: 1 }, animated]}>
        {children}
      </Animated.View>
    </View>
  );
}
