import { router } from 'expo-router';
import { ArrowUpRight, Check, Droplets, Footprints, Utensils } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Button, Card, Text, useTheme } from '@/design-system';
import { useNutritionStore } from '@/features/nutrition/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { todayKey } from '@/lib/date';

import { useActivityStore } from './store';

export function DailyPlan({ onWater }: { onWater: () => void }) {
  const { colors } = useTheme();
  const today = useActivityStore((s) => s.get());
  const targets = useOnboardingStore((s) => s.profile.targets);
  const meals = useNutritionStore((s) => s.meals);
  const items = [
    {
      title: 'Make time to move',
      detail: `${today.activeMinutes} of ${targets.activeMinutes} active minutes`,
      done: today.activeMinutes >= targets.activeMinutes,
      icon: Footprints,
      action: 'Find a workout',
      run: () => router.push('/(tabs)/workouts'),
    },
    {
      title: 'A moment to hydrate',
      detail: `${(today.waterMl / 1000).toFixed(1)} of ${(targets.waterMl / 1000).toFixed(1)} L today`,
      done: today.waterMl >= targets.waterMl,
      icon: Droplets,
      action: 'Add 250 ml',
      run: onWater,
    },
    {
      title: 'Keep a food journal',
      detail: 'Log a meal to remember your day.',
      done: meals.some((meal) => meal.day === todayKey()),
      icon: Utensils,
      action: 'Log your meal',
      run: () => router.push('/(tabs)/nutrition'),
    },
  ];
  const done = items.filter((item) => item.done).length;
  return (
    <Card style={{ gap: 20, flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <Text variant="subhead" heading={2}>
          Small wins today
        </Text>
        <Text variant="label" color="brand">
          {done} / 3
        </Text>
      </View>
      <View
        style={{ flexDirection: 'row', gap: 6 }}
        accessibilityLabel={`${done} of 3 daily habits completed`}
      >
        {items.map((item) => (
          <View
            key={item.title}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: item.done ? colors.fg.brand : colors.data.track,
            }}
          />
        ))}
      </View>
      {items.map((item) => (
        <View key={item.title} style={{ flexDirection: 'row', gap: 12 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 13,
              backgroundColor: item.done ? colors.bg.successSubtle : colors.bg.subtle,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {item.done ? (
              <Check size={18} color={colors.fg.success} />
            ) : (
              <item.icon size={18} color={colors.fg.secondary} />
            )}
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Text variant="bodyStrong">{item.title}</Text>
            <Text variant="caption" color="secondary">
              {item.detail}
            </Text>
            {item.done ? (
              <Text variant="caption" color="success">
                Complete for today
              </Text>
            ) : (
              <Button
                label={item.action}
                variant="ghost"
                rightIcon={ArrowUpRight}
                onPress={item.run}
                style={{ alignSelf: 'flex-start' }}
              />
            )}
          </View>
        </View>
      ))}
    </Card>
  );
}
