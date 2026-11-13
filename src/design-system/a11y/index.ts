import { useEffect, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Platform } from 'react-native';

export * from './contrast';

/** Announce a message to VoiceOver / TalkBack / web live region. */
export function announce(message: string, options?: { queue?: boolean }) {
  if (Platform.OS === 'web') {
    // RN Web supports announceForAccessibility via a hidden live region.
    AccessibilityInfo.announceForAccessibility?.(message);
    return;
  }
  if (options?.queue && Platform.OS === 'ios') {
    AccessibilityInfo.announceForAccessibilityWithOptions?.(message, { queue: true });
    return;
  }
  AccessibilityInfo.announceForAccessibility(message);
}

/** Move accessibility focus to a mounted component (e.g. first heading after navigation). */
export function focusOn(ref: React.RefObject<unknown> | null | undefined) {
  if (!ref?.current) return;
  const node = findNodeHandle(ref.current as never);
  if (node != null) AccessibilityInfo.setAccessibilityFocus(node);
}

/** True when a screen reader (VoiceOver/TalkBack) is active. */
export function useScreenReaderEnabled(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isScreenReaderEnabled()
      .then((v) => mounted && setEnabled(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('screenReaderChanged', setEnabled);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return enabled;
}

/** Combine OS reduce-motion with an in-app override. */
export function useReduceMotion(appOverride?: boolean): boolean {
  const [os, setOs] = useState(false);
  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled()
      .then((v) => mounted && setOs(v))
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', setOs);
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);
  return appOverride ?? os;
}

/** Minimum 44x44 pt hit area (WCAG 2.5.5 / Apple HIG / Material). */
export const MIN_TOUCH = 44;

export function hitSlopFor(size: number) {
  const pad = Math.max(0, (MIN_TOUCH - size) / 2);
  return { top: pad, bottom: pad, left: pad, right: pad };
}
