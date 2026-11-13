import { router } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';

import { Input, SegmentedControl, Text, useTheme } from '@/design-system';
import { OnboardingShell } from '@/features/onboarding/OnboardingShell';
import { useOnboardingStore, type ActivityLevel, type Units } from '@/features/onboarding/store';

const LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'active', label: 'Active' },
];
const UNITS: { value: Units; label: string }[] = [
  { value: 'metric', label: 'kg · cm' },
  { value: 'imperial', label: 'lb · in' },
];

export default function AboutYou() {
  const { spacing } = useTheme();
  const profile = useOnboardingStore((s) => s.profile);
  const setProfile = useOnboardingStore((s) => s.setProfile);
  const [name, setName] = useState(profile.name);
  const [height, setHeight] = useState(
    profile.heightCm
      ? String(profile.units === 'metric' ? profile.heightCm : Math.round(profile.heightCm / 2.54))
      : '',
  );
  const [weight, setWeight] = useState(
    profile.weightKg
      ? String(profile.units === 'metric' ? profile.weightKg : Math.round(profile.weightKg * 2.205))
      : '',
  );
  const [touched, setTouched] = useState(false);

  const h = Number(height);
  const w = Number(weight);
  const heightErr =
    touched && height !== '' && !(h > 50 && h < 300) ? 'Enter a realistic height.' : undefined;
  const weightErr =
    touched && weight !== '' && !(w > 20 && w < 700) ? 'Enter a realistic weight.' : undefined;
  const nameErr = touched && name.trim().length > 40 ? 'Keep it under 40 characters.' : undefined;

  const save = () => {
    setTouched(true);
    if (heightErr || weightErr || nameErr) return false;
    const metric = profile.units === 'metric';
    setProfile({
      name: name.trim(),
      heightCm: height ? Math.round(metric ? h : h * 2.54) : null,
      weightKg: weight ? Math.round((metric ? w : w / 2.205) * 10) / 10 : null,
    });
    return true;
  };

  return (
    <OnboardingShell
      step="about_you"
      title="A little about you"
      subtitle="Optional, but it makes your targets more accurate. Stored on this device."
      onNext={() => {
        if (save()) router.push('/(onboarding)/schedule');
      }}
      onSkip={() => router.push('/(onboarding)/schedule')}
    >
      <Input
        label="What should we call you?"
        value={name}
        onChangeText={setName}
        placeholder="First name"
        autoCapitalize="words"
        autoComplete="given-name"
        textContentType="givenName"
        returnKeyType="next"
        errorText={nameErr}
      />

      <View style={{ gap: spacing['2'] }}>
        <Text variant="label" color="secondary">
          Units
        </Text>
        <SegmentedControl
          accessibilityLabel="Measurement units"
          options={UNITS}
          value={profile.units}
          onChange={(units) => setProfile({ units })}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: spacing['3'] }}>
        <View style={{ flex: 1 }}>
          <Input
            label="Height"
            value={height}
            onChangeText={setHeight}
            keyboardType="number-pad"
            inputMode="numeric"
            suffix={profile.units === 'metric' ? 'cm' : 'in'}
            errorText={heightErr}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Input
            label="Weight"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            inputMode="decimal"
            suffix={profile.units === 'metric' ? 'kg' : 'lb'}
            errorText={weightErr}
          />
        </View>
      </View>

      <View style={{ gap: spacing['2'] }}>
        <Text variant="label" color="secondary">
          Typical activity level
        </Text>
        <SegmentedControl
          accessibilityLabel="Activity level"
          options={LEVELS}
          value={profile.activityLevel}
          onChange={(activityLevel) => setProfile({ activityLevel })}
        />
      </View>
    </OnboardingShell>
  );
}
