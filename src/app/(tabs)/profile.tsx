import { router } from 'expo-router';
import {
  Accessibility,
  BarChart3,
  FlaskConical,
  Palette,
  RotateCcw,
  Target,
  Vibrate,
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, Platform, Switch, View } from 'react-native';

import { useAnalytics } from '@/analytics';
import {
  Card,
  Button,
  PageHeader,
  ListItem,
  Screen,
  SegmentedControl,
  Text,
  useTheme,
  useThemePreference,
  useMotionPreference,
  type ThemePreference,
} from '@/design-system';
import { experiments, useExperimentsStore, type ExperimentKey } from '@/experiments';
import { useActivityStore } from '@/features/activity/store';
import { useCoachStore } from '@/features/coach/store';
import { useNutritionStore } from '@/features/nutrition/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { useSettingsStore } from '@/features/profile/settingsStore';
import { useWorkoutsStore } from '@/features/workouts/store';

const THEMES: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export default function Profile() {
  const { colors, spacing } = useTheme();
  const analytics = useAnalytics();
  const { preference, setPreference } = useThemePreference();
  const profile = useOnboardingStore((s) => s.profile);
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const resetOnboarding = useOnboardingStore((s) => s.reset);
  const settings = useSettingsStore();
  const reduceMotion = useMotionPreference();
  const history = useWorkoutsStore((s) => s.history);
  const exp = useExperimentsStore();
  const [showTools, setShowTools] = useState(false);

  const resetAll = () => {
    const doReset = () => {
      resetOnboarding();
      useActivityStore.getState().reset();
      useWorkoutsStore.getState().reset();
      useNutritionStore.getState().reset();
      useCoachStore.getState().clear();
      exp.reset();
      router.replace('/(onboarding)/welcome');
    };
    if (Platform.OS === 'web') {
      if (globalThis.confirm?.('Reset all local data and restart onboarding?')) doReset();
    } else {
      Alert.alert('Reset app?', 'This clears all local data and restarts onboarding.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: doReset },
      ]);
    }
  };

  return (
    <Screen>
      <View style={{ gap: spacing['5'] }}>
        <PageHeader
          title={profile.name || 'Your space'}
          eyebrow="MADE FOR YOU"
          subtitle={`${history.length} workouts logged · ${profile.daysPerWeek} days/week plan`}
        />

        <Card style={{ gap: spacing['3'] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
            <Palette size={18} color={colors.fg.brand} />
            <Text variant="subhead" heading={2}>
              Appearance
            </Text>
          </View>
          <SegmentedControl
            accessibilityLabel="Theme"
            options={THEMES}
            value={preference}
            onChange={(p) => {
              setPreference(p);
              analytics.track('theme_changed', { preference: p });
            }}
          />
        </Card>

        <Card style={{ gap: spacing['1'] }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: spacing['2'],
              marginBottom: spacing['2'],
            }}
          >
            <Accessibility size={18} color={colors.fg.brand} />
            <Text variant="subhead" heading={2}>
              Accessibility
            </Text>
          </View>
          <ListItem
            title="Reduce motion"
            subtitle={
              settings.reduceMotion == null
                ? 'Following system setting'
                : settings.reduceMotion
                  ? 'On'
                  : 'Off'
            }
            right={
              <Switch
                accessibilityLabel="Reduce motion"
                value={reduceMotion}
                onValueChange={(v) => {
                  settings.set({ reduceMotion: v });
                  analytics.track('reduce_motion_changed', { enabled: v });
                }}
                trackColor={{ true: colors.action.primary, false: colors.border.default }}
              />
            }
          />
          <ListItem
            title="Haptic feedback"
            icon={Vibrate}
            right={
              <Switch
                accessibilityLabel="Haptic feedback"
                value={settings.hapticsEnabled}
                onValueChange={(v) => settings.set({ hapticsEnabled: v })}
                trackColor={{ true: colors.action.primary, false: colors.border.default }}
              />
            }
          />
          <ListItem
            title="Units"
            icon={Target}
            right={
              <SegmentedControl
                accessibilityLabel="Units"
                options={[
                  { value: 'metric', label: 'Metric' },
                  { value: 'imperial', label: 'Imperial' },
                ]}
                value={profile.units}
                onChange={(units) => {
                  setProfile({ units });
                  analytics.track('units_changed', { units });
                }}
                style={{ width: 180 }}
              />
            }
          />
        </Card>

        <Card style={{ gap: spacing['1'] }}>
          <ListItem
            title="Weekly insights"
            subtitle="Steps, activity and sleep trends"
            icon={BarChart3}
            onPress={() => router.push('/insights')}
          />
          {showTools ? (
            <ListItem
              title="Design system"
              subtitle="Live component gallery for design ↔ dev handoff"
              icon={Palette}
              onPress={() => router.push('/design-system')}
            />
          ) : null}
        </Card>

        {__DEV__ ? (
          <Button
            label={showTools ? 'Hide developer tools' : 'Developer tools'}
            variant="ghost"
            onPress={() => setShowTools((value) => !value)}
          />
        ) : null}
        {showTools ? (
          <Card style={{ gap: spacing['2'] }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}>
              <FlaskConical size={18} color={colors.fg.brand} />
              <Text variant="subhead" heading={2}>
                Experiments
              </Text>
            </View>
            <Text variant="caption" color="muted">
              Unit {exp.unitId.slice(-6)}. Override variants to QA each arm; overrides are logged as
              new exposures.
            </Text>
            {(Object.keys(experiments) as ExperimentKey[]).map((k) => {
              const def = experiments[k];
              return (
                <View key={k} style={{ gap: spacing['1'], paddingVertical: spacing['1'] }}>
                  <Text variant="label">{def.description}</Text>
                  <SegmentedControl
                    accessibilityLabel={`${def.description} variant`}
                    options={def.variants.map((v) => ({ value: v.id, label: v.id }))}
                    value={exp.variantFor(k)}
                    onChange={(v) => exp.setOverride(k, v)}
                  />
                </View>
              );
            })}
          </Card>
        ) : null}

        <ListItem
          title="Reset app data"
          subtitle="Clears everything on this device"
          icon={RotateCcw}
          iconColor={colors.fg.danger}
          onPress={resetAll}
          chevron={false}
        />
      </View>
    </Screen>
  );
}
