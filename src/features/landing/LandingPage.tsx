import { router } from 'expo-router';
import {
  Activity,
  ArrowDown,
  ArrowRight,
  Check,
  CheckCheck,
  Dumbbell,
  Leaf,
  MessageCircleHeart,
  Moon,
  Sparkles,
} from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { useAnalytics } from '@/analytics';
import { Button, Text, fontFamilies, useMotionPreference, useTheme } from '@/design-system';
import { DepthSurface } from '@/design-system/motion/DepthSurface';
import { ScrollReveal } from '@/design-system/motion/ScrollReveal';
import { ONBOARDING_STEPS, useOnboardingStore } from '@/features/onboarding/store';
import { MovementExplorer } from './MovementExplorer';
import { WellnessStory } from './WellnessStory';
import { BotanicalBackdrop } from './BotanicalBackdrop';

const FEATURES = [
  {
    icon: Activity,
    number: '01',
    title: 'See the small wins.',
    body: 'Steps, active minutes, and daily progress. A clearer picture of how you’re doing, all in one place.',
  },
  {
    icon: Dumbbell,
    number: '02',
    title: 'Make time for you.',
    body: 'Find a workout that fits your goals and your day. Follow the guided session at your own pace.',
  },
  {
    icon: MessageCircleHeart,
    number: '03',
    title: 'Find your next step.',
    body: 'Ask your coach for a workout idea, a hydration check, or a little help getting back into a routine.',
  },
];

/** Public introduction shared by the home route and existing welcome links. */
export default function LandingPage() {
  const { colors, elevation, compact } = useTheme();
  const { width, height, fontScale } = useWindowDimensions();
  const reduced = useMotionPreference();
  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });
  const insets = useSafeAreaInsets();
  const wide = width >= 850 && fontScale < 1.5;
  const heroDepth = useAnimatedStyle(() => {
    const progress = interpolate(scrollY.value, [0, 620], [0, 1], Extrapolation.CLAMP);
    return {
      transform: reduced
        ? []
        : [
            { perspective: 1400 },
            { rotateX: `${wide ? 6 * (1 - progress) : 0}deg` },
            { rotateY: `${wide ? -8 * (1 - progress) : 0}deg` },
            { translateY: -progress * (wide ? 32 : 12) },
          ],
    };
  }, [reduced, wide]);
  const ringSize = compact ? Math.min(152, width - 112) : Math.min(210, width - 136);
  const completed = useOnboardingStore((s) => s.completed);
  const start = useOnboardingStore((s) => s.start);
  const analytics = useAnalytics();
  const scroll = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const [featureY, setFeatureY] = useState(0);
  const [arrivedAt] = useState(() => Date.now());

  useEffect(() => {
    if (!completed) {
      analytics.track('onboarding_step_viewed', {
        step: 'welcome',
        index: 0,
        total: ONBOARDING_STEPS.length,
      });
    }
  }, [analytics, completed]);

  const getStarted = () => {
    if (completed) {
      router.push('/(tabs)');
      return;
    }
    start();
    analytics.track('onboarding_step_completed', {
      step: 'welcome',
      index: 0,
      duration_ms: Date.now() - arrivedAt,
    });
    router.push('/(onboarding)/goals');
  };
  const explore = () => scroll.current?.scrollTo({ y: featureY, animated: !reduced });
  const cta = completed ? 'Open my dashboard' : 'Get started';
  const headline = {
    fontFamily: fontFamilies.editorial,
    fontSize: compact ? (width < 360 ? 34 : 38) : wide ? 72 : 46,
    lineHeight: compact ? (width < 360 ? 39 : 43) : wide ? 78 : 52,
    fontWeight: '400' as const,
    letterSpacing: compact ? -0.8 : -1.8,
  };

  return (
    <Animated.ScrollView
      testID="landing-scroll"
      ref={scroll}
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: colors.bg.canvas }}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
    >
      <View style={[styles.container, { paddingHorizontal: compact ? 16 : wide ? 48 : 24 }]}>
        <View
          style={[
            styles.nav,
            compact && { paddingVertical: 14, gap: 12 },
            { borderBottomColor: colors.border.default },
          ]}
        >
          <View style={styles.brand}>
            <View
              style={[
                styles.logo,
                compact && { width: 32, height: 32, borderRadius: 10 },
                { backgroundColor: colors.action.primary },
              ]}
            >
              <Activity size={compact ? 20 : 24} color={colors.fg.onBrand} />
            </View>
            <Text style={[styles.wordmark, compact && { fontSize: 26, lineHeight: 32 }]}>
              vitalis<Text color="brand">.</Text>
            </Text>
          </View>
          <View style={styles.navActions}>
            {wide ? <Button label="Why Vitalis" variant="ghost" onPress={explore} /> : null}
            <Button label={cta} size="sm" onPress={getStarted} rightIcon={ArrowRight} />
          </View>
        </View>

        <View
          style={[
            styles.hero,
            {
              flexDirection: wide ? 'row' : 'column',
              paddingVertical: compact ? 28 : wide ? 76 : 40,
            },
            compact && { gap: 28 },
          ]}
        >
          <View style={[styles.heroCopy, compact && { gap: 16 }, wide && { flex: 1.1 }]}>
            <View style={[styles.eyebrow, { backgroundColor: colors.bg.brandSubtle }]}>
              <Leaf size={15} color={colors.fg.brand} />
              <Text variant="label" color="brand">
                A little better, every day
              </Text>
            </View>
            <Text heading={1} style={headline}>
              Feel stronger.{'\n'}Live better.{'\n'}
              <Text color="accent" style={[headline, { fontStyle: 'italic' }]}>
                Start small.
              </Text>
            </Text>
            <Text
              color="secondary"
              style={[styles.intro, compact && { fontSize: 16, lineHeight: 24 }]}
            >
              Your healthier day starts here. Bring movement, mindful habits, and a little guidance
              together with Vitalis.
            </Text>
            <View style={styles.ctas}>
              <Button
                label={cta}
                size={compact ? 'md' : 'lg'}
                rightIcon={ArrowRight}
                onPress={getStarted}
              />
              <Button
                label="Explore Vitalis"
                variant="ghost"
                rightIcon={ArrowDown}
                onPress={explore}
              />
            </View>
            <View style={styles.reassurance}>
              <Check size={16} color={colors.fg.brand} />
              <Text variant="label" color="secondary">
                About a minute to set up. Built around you.
              </Text>
            </View>
          </View>

          <Animated.View
            testID="landing-depth-hero"
            style={[{ width: '100%', maxWidth: 480 }, wide && { flex: 1 }, heroDepth]}
          >
            <View
              pointerEvents="none"
              aria-hidden
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={{
                position: 'absolute',
                top: 24,
                bottom: 24,
                left: 8,
                right: 8,
                borderRadius: 32,
                backgroundColor: colors.bg.brandSubtle,
                borderWidth: 1,
                borderColor: colors.border.default,
                transform: [{ rotate: wide && !reduced ? '-4deg' : '0deg' }, { translateY: 12 }],
              }}
            />
            <DepthSurface>
              <View
                style={[
                  styles.previewStage,
                  compact && { padding: 14, gap: 12, borderRadius: 24 },
                  { backgroundColor: colors.bg.brandSubtle },
                  elevation.md,
                ]}
              >
                <BotanicalBackdrop />
                <View
                  style={[
                    styles.previewCaption,
                    { backgroundColor: colors.bg.surface, padding: 10, borderRadius: 999 },
                  ]}
                >
                  <Sparkles size={14} color={colors.fg.brand} />
                  <Text variant="caption" color="brand">
                    YOUR DAY, A LITTLE MORE BALANCED
                  </Text>
                </View>
                <View
                  style={[
                    styles.dashboard,
                    compact && { padding: 14, gap: 12, borderRadius: 18 },
                    { backgroundColor: colors.bg.surface, borderColor: colors.border.default },
                  ]}
                >
                  <View style={styles.previewHeader}>
                    <View>
                      <Text variant="caption" color="secondary">
                        A fresh start
                      </Text>
                      <Text variant="headline">Your daily rhythm</Text>
                    </View>
                    <View style={[styles.smallIcon, { backgroundColor: colors.bg.brandSubtle }]}>
                      <Leaf size={20} color={colors.fg.brand} />
                    </View>
                  </View>
                  <View
                    style={[styles.ring, { width: ringSize, height: ringSize }]}
                    accessible
                    accessibilityLabel="Sample activity: 6,420 of 8,000 steps"
                  >
                    <View
                      accessibilityElementsHidden
                      importantForAccessibility="no-hide-descendants"
                      aria-hidden
                    >
                      <Svg width={ringSize} height={ringSize} viewBox="0 0 210 210">
                        {[
                          { r: 91, value: 0.8, color: colors.fg.brand },
                          { r: 74, value: 0.65, color: colors.data.energy },
                          { r: 57, value: 0.72, color: colors.data.hydration },
                        ].map(({ r, value, color }) => (
                          <React.Fragment key={r}>
                            <Circle
                              cx={105}
                              cy={105}
                              r={r}
                              fill="none"
                              stroke={colors.bg.subtle}
                              strokeWidth={11}
                            />
                            <Circle
                              cx={105}
                              cy={105}
                              r={r}
                              fill="none"
                              stroke={color}
                              strokeWidth={11}
                              strokeLinecap="round"
                              strokeDasharray={`${2 * Math.PI * r * value} ${2 * Math.PI * r}`}
                              transform="rotate(-90 105 105)"
                            />
                          </React.Fragment>
                        ))}
                      </Svg>
                    </View>
                    <View style={styles.ringLabel}>
                      <Text style={{ fontSize: 30, lineHeight: 36, fontWeight: '700' }}>6,420</Text>
                      <Text variant="caption" color="secondary">
                        steps today
                      </Text>
                    </View>
                  </View>
                  <View style={styles.metrics}>
                    {[
                      { value: '24 min', label: 'Movement', color: colors.fg.brand },
                      { value: '1.5 L', label: 'Water', color: colors.data.hydration },
                      { value: '7.5 hrs', label: 'Sleep', color: colors.fg.primary },
                    ].map((metric) => (
                      <View key={metric.label} style={styles.metric}>
                        <Text variant="bodyStrong" color={metric.color}>
                          {metric.value}
                        </Text>
                        <Text variant="caption" color="secondary">
                          {metric.label}
                        </Text>
                      </View>
                    ))}
                  </View>
                  <View style={[styles.workout, { backgroundColor: colors.bg.subtle }]}>
                    <Dumbbell size={22} color={colors.fg.brand} />
                    <View style={{ flex: 1 }}>
                      <Text variant="label">A little movement goes a long way</Text>
                      <Text variant="caption" color="secondary">
                        Find your next guided workout
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.encouragement, { backgroundColor: colors.bg.surface }]}>
                  <CheckCheck size={22} color={colors.fg.brand} />
                  <View style={{ flex: 1 }}>
                    <Text variant="label">Progress over perfection.</Text>
                    <Text variant="caption" color="secondary">
                      Every small win counts.
                    </Text>
                  </View>
                </View>
                <Text
                  variant="caption"
                  color="secondary"
                  align="center"
                  style={{ backgroundColor: colors.bg.surface, padding: 8, borderRadius: 12 }}
                >
                  A glimpse of your dashboard · sample data
                </Text>
              </View>
            </DepthSurface>
          </Animated.View>
        </View>

        <View
          style={[
            styles.pillars,
            compact && {
              gap: 14,
              paddingVertical: 20,
              alignItems: 'flex-start',
              flexDirection: 'column',
            },
            { borderColor: colors.border.default },
          ]}
        >
          {[
            { icon: Activity, label: 'Move with purpose' },
            { icon: Leaf, label: 'Build better habits' },
            { icon: Moon, label: 'Make room to recover' },
          ].map(({ icon: Icon, label }) => (
            <View key={label} style={styles.pillar}>
              <Icon size={20} color={colors.fg.brand} />
              <Text variant="label" color="secondary">
                {label}
              </Text>
            </View>
          ))}
        </View>

        <ScrollReveal
          scrollY={scrollY}
          viewportHeight={height}
          onLayout={(event) => setFeatureY(event.nativeEvent.layout.y)}
          style={[styles.features, compact && { paddingVertical: 32, gap: 12 }]}
        >
          <Text variant="label" color="brand" style={styles.kicker}>
            LESS OVERWHELM. MORE EVERYDAY PROGRESS.
          </Text>
          <Text
            heading={2}
            style={[styles.sectionTitle, compact && { fontSize: 28, lineHeight: 34 }]}
          >
            Wellness that fits your life.
          </Text>
          <Text color="secondary" style={{ maxWidth: 580 }}>
            You don’t need to change everything at once. Just find your next small step.
          </Text>
          <View
            style={[
              styles.featureGrid,
              compact && { gap: 20, marginTop: 12 },
              { flexDirection: wide ? 'row' : 'column' },
            ]}
          >
            {FEATURES.map(({ icon: Icon, number, title, body }) => (
              <View
                key={number}
                style={[
                  styles.feature,
                  compact && { paddingTop: 16, gap: 12 },
                  { borderTopColor: colors.border.default },
                  wide && { flex: 1 },
                ]}
              >
                <View style={styles.previewHeader}>
                  <Icon size={28} color={colors.fg.brand} />
                  <Text variant="caption" color="muted">
                    {number}
                  </Text>
                </View>
                <Text variant="headline" heading={3}>
                  {title}
                </Text>
                <Text color="secondary">{body}</Text>
              </View>
            ))}
          </View>
        </ScrollReveal>

        <ScrollReveal scrollY={scrollY} viewportHeight={height}>
          <WellnessStory onStart={getStarted} />
        </ScrollReveal>
        <ScrollReveal scrollY={scrollY} viewportHeight={height}>
          <MovementExplorer onStart={getStarted} />
        </ScrollReveal>

        <View
          style={[
            styles.closing,
            compact && { paddingVertical: 28, paddingHorizontal: 16, gap: 16 },
            { backgroundColor: colors.bg.brandSubtle },
          ]}
        >
          <Text
            heading={2}
            style={[styles.sectionTitle, compact && { fontSize: 28, lineHeight: 34 }]}
            align="center"
          >
            Your pace. Your goals. Your Vitalis.
          </Text>
          <Text color="secondary" align="center">
            Choose what matters to you. We’ll help you make a start.
          </Text>
          <View style={{ alignItems: 'center' }}>
            <Button
              label={cta}
              rightIcon={ArrowRight}
              size={compact ? 'md' : 'lg'}
              onPress={getStarted}
            />
          </View>
        </View>
        <View
          style={[
            styles.footer,
            compact && { marginTop: 28, paddingVertical: 20 },
            { borderTopColor: colors.border.default },
          ]}
        >
          <Text variant="bodyStrong">vitalis.</Text>
          <Text variant="caption" color="secondary">
            Small wins, every day.
          </Text>
        </View>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 1240, alignSelf: 'center' },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 22,
    borderBottomWidth: 1,
    flexWrap: 'wrap',
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  wordmark: {
    fontFamily: fontFamilies.editorial,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '400',
    letterSpacing: -1.2,
  },
  navActions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  hero: { gap: 44, alignItems: 'center' },
  heroCopy: { gap: 24, width: '100%' },
  eyebrow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 30,
    alignSelf: 'flex-start',
    alignItems: 'center',
  },
  intro: { fontSize: 18, lineHeight: 29, maxWidth: 440 },
  ctas: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  reassurance: { flexDirection: 'row', alignItems: 'center', gap: 7, flexWrap: 'wrap' },
  previewStage: { width: '100%', borderRadius: 32, padding: 22, gap: 18, maxWidth: 480 },
  previewCaption: {
    flexDirection: 'row',
    gap: 7,
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  dashboard: { padding: 20, borderRadius: 22, borderWidth: 1, gap: 18 },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    flexWrap: 'wrap',
  },
  smallIcon: { padding: 10, borderRadius: 14 },
  ring: {
    alignSelf: 'center',
    width: 210,
    height: 210,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringLabel: { position: 'absolute', alignItems: 'center' },
  metrics: { flexDirection: 'row', justifyContent: 'space-around', gap: 8, flexWrap: 'wrap' },
  metric: { alignItems: 'center', gap: 4 },
  workout: { borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  encouragement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 16,
  },
  pillars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 24,
    paddingVertical: 28,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  pillar: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  features: { paddingVertical: 64, gap: 16 },
  kicker: { letterSpacing: 1.4, fontSize: 11 },
  sectionTitle: {
    fontFamily: fontFamilies.editorial,
    fontSize: 36,
    lineHeight: 44,
    fontWeight: '400',
    letterSpacing: -0.8,
  },
  featureGrid: { gap: 32, marginTop: 24 },
  feature: { borderTopWidth: 1, paddingTop: 24, gap: 18 },
  closing: { paddingVertical: 40, paddingHorizontal: 24, gap: 20, borderRadius: 24 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 12,
    paddingVertical: 28,
    marginTop: 48,
    borderTopWidth: 1,
  },
});
