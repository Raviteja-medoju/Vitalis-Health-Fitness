/**
 * Motion system. Durations/easings come from tokens so Figma prototype timings
 * (Smart Animate) and code stay identical. Every helper respects Reduce Motion.
 */
import { useCallback, useEffect } from 'react';
import {
  Easing,
  cancelAnimation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  FadeOut,
  Layout,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

import { useSettingsStore } from '@/features/profile/settingsStore';

import { primitive } from '../tokens/generated';

export function useMotionPreference() {
  const system = useReducedMotion();
  const override = useSettingsStore((s) => s.reduceMotion);
  return override ?? system;
}

export const duration = primitive.duration;

const bez = (c: readonly [number, number, number, number]) => Easing.bezier(c[0], c[1], c[2], c[3]);

export const easing = {
  standard: bez(primitive.easing.standard as unknown as [number, number, number, number]),
  decelerate: bez(primitive.easing.decelerate as unknown as [number, number, number, number]),
  accelerate: bez(primitive.easing.accelerate as unknown as [number, number, number, number]),
};

export const timing = {
  fast: { duration: duration.fast, easing: easing.standard } satisfies WithTimingConfig,
  base: { duration: duration.base, easing: easing.standard } satisfies WithTimingConfig,
  slow: { duration: duration.slow, easing: easing.decelerate } satisfies WithTimingConfig,
  slower: { duration: duration.slower, easing: easing.decelerate } satisfies WithTimingConfig,
};

export const spring = {
  /** Snappy press feedback. */
  press: { damping: 18, stiffness: 320, mass: 0.6 } satisfies WithSpringConfig,
  /** Gentle layout settle. */
  gentle: { damping: 20, stiffness: 180, mass: 0.9 } satisfies WithSpringConfig,
  /** Celebratory overshoot (goal reached). */
  bouncy: { damping: 10, stiffness: 220, mass: 0.8 } satisfies WithSpringConfig,
};

/** Entering/exiting presets for list items & cards. Pass `index` to stagger. */
export const enter = {
  fadeUp: (index = 0) =>
    FadeInUp.duration(duration.base)
      .delay(Math.min(index, 8) * 40)
      .easing(easing.decelerate),
  fadeDown: (index = 0) =>
    FadeInDown.duration(duration.base)
      .delay(Math.min(index, 8) * 40)
      .easing(easing.decelerate),
  fade: (index = 0) => FadeIn.duration(duration.base).delay(Math.min(index, 8) * 40),
  out: FadeOut.duration(duration.fast),
  layout: Layout.duration(duration.base),
};

/**
 * Press-scale micro-interaction. Returns handlers + animated style.
 * Falls back to opacity-only under Reduce Motion.
 */
export function usePressScale(scaleTo = 0.97) {
  const reduce = useMotionPreference();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const onPressIn = useCallback(() => {
    if (reduce) {
      opacity.value = withTiming(0.7, timing.fast);
    } else {
      scale.value = withSpring(scaleTo, spring.press);
    }
  }, [reduce, scale, opacity, scaleTo]);

  const onPressOut = useCallback(() => {
    opacity.value = reduce ? 1 : withTiming(1, timing.fast);
    scale.value = reduce ? 1 : withSpring(1, spring.press);
  }, [scale, opacity, reduce]);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return { onPressIn, onPressOut, style };
}

/** Animated progress value 0..1 that eases to its target; instant under Reduce Motion. */
export function useAnimatedProgress(target: number, config: WithTimingConfig = timing.slower) {
  const reduce = useMotionPreference();
  const progress = useSharedValue(0);
  const clamped = Math.max(0, Math.min(1, Number.isFinite(target) ? target : 0));
  useEffect(() => {
    progress.value = reduce ? clamped : withTiming(clamped, config);
    return () => cancelAnimation(progress);
  }, [clamped, config, progress, reduce]);
  return progress;
}
