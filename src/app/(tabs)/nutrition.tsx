import { Flame, Plus } from 'lucide-react-native';
import React, { useState } from 'react';
import { View } from 'react-native';

import { useAnalytics } from '@/analytics';
import {
  Button,
  ActionNotice,
  Card,
  Chip,
  Input,
  ProgressRing,
  PageHeader,
  ResponsiveGrid,
  Screen,
  Text,
  announce,
  useTheme,
} from '@/design-system';
import { useActivityStore } from '@/features/activity/store';
import { QUICK_MEALS, useNutritionStore, type MealEntry } from '@/features/nutrition/store';
import { useOnboardingStore } from '@/features/onboarding/store';
import { formatNumber } from '@/lib/date';
import { HydrationCard } from '@/features/nutrition/HydrationCard';
import { MealHistory } from '@/features/nutrition/MealHistory';

export default function Nutrition() {
  const { colors, spacing } = useTheme();
  const analytics = useAnalytics();
  const targets = useOnboardingStore((s) => s.profile.targets);
  const today = useActivityStore((s) => s.get());
  const add = useActivityStore((s) => s.add);
  const addMeal = useNutritionStore((s) => s.addMeal);
  const removeMeal = useNutritionStore((s) => s.removeMeal);
  const restoreMeal = useNutritionStore((s) => s.restoreMeal);
  const [name, setName] = useState('');
  const [kcal, setKcal] = useState('');
  const [err, setErr] = useState<string | undefined>();
  const [notice, setNotice] = useState<{ message: string; removed?: MealEntry } | null>(null);

  const logWater = (ml: number) => {
    add({ waterMl: ml });
    analytics.track('water_logged', { amount_ml: ml, total_ml: today.waterMl + ml });
    announce(`Logged ${ml} millilitres.`);
    setNotice({ message: `${ml} ml of water logged. A small win for today.` });
  };

  const logMeal = (n: string, k: number) => {
    if (!n.trim() || !Number.isFinite(k) || !(k >= 1 && k <= 5000)) {
      setErr('Enter a name and calories between 1 and 5000.');
      return;
    }
    setErr(undefined);
    const meal = addMeal(n, k);
    add({ kcalEaten: meal.kcal });
    analytics.track('meal_logged', { kcal: meal.kcal, total_kcal: today.kcalEaten + meal.kcal });
    announce(`Logged ${meal.name}, ${meal.kcal} calories.`);
    setNotice({ message: `${meal.name} added · ${meal.kcal} kcal` });
    setName('');
    setKcal('');
  };

  const left = Math.max(0, targets.kcal - today.kcalEaten);
  const undoRemoval = () => {
    const meal = notice?.removed;
    if (!meal) return;
    if (restoreMeal(meal)) add({ kcalEaten: meal.kcal }, meal.day);
    setNotice({ message: `${meal.name} restored.` });
    announce(`${meal.name} restored.`);
  };

  return (
    <Screen
      wide
      footer={
        notice ? (
          <ActionNotice
            message={notice.message}
            onDismiss={() => setNotice(null)}
            onUndo={notice.removed ? undoRemoval : undefined}
          />
        ) : undefined
      }
    >
      <View style={{ gap: spacing['5'] }}>
        <PageHeader
          title="Nutrition"
          eyebrow="NOURISH YOUR DAY"
          subtitle="Keep it simple. A meal, a glass of water, a little more balance."
        />

        <ResponsiveGrid>
          <Card
            elevated
            style={{
              flex: 1,
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: spacing['4'],
            }}
          >
            <ProgressRing
              value={today.kcalEaten / targets.kcal}
              size={120}
              color={colors.data.energy}
              accessibilityLabel="Calories eaten"
              accessibilityValueText={`${formatNumber(today.kcalEaten)} of ${formatNumber(targets.kcal)} calories`}
            >
              <View style={{ alignItems: 'center' }}>
                <Text variant="metricSm">{formatNumber(left)}</Text>
                <Text variant="caption" color="muted">
                  kcal left
                </Text>
              </View>
            </ProgressRing>
            <View style={{ flex: 1, gap: spacing['2'] }}>
              <View>
                <Text variant="caption" color="secondary">
                  Eaten
                </Text>
                <Text variant="bodyStrong">{formatNumber(today.kcalEaten)} kcal</Text>
              </View>
              <View>
                <Text variant="caption" color="secondary">
                  Burned (workouts)
                </Text>
                <Text variant="bodyStrong">{formatNumber(today.kcalBurned)} kcal</Text>
              </View>
              <View>
                <Text variant="caption" color="secondary">
                  Budget
                </Text>
                <Text variant="bodyStrong">{formatNumber(targets.kcal)} kcal</Text>
              </View>
            </View>
          </Card>

          <HydrationCard amount={today.waterMl} target={targets.waterMl} onAdd={logWater} />
        </ResponsiveGrid>

        <ResponsiveGrid minItemWidth={340}>
          <Card style={{ gap: spacing['3'] }}>
            <Text variant="subhead" heading={2}>
              Log a meal
            </Text>
            <Text variant="caption" color="secondary">
              Add to today’s journal. Browse past days in your food journal.
            </Text>
            <View
              style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}
              accessibilityLabel="Quick add"
            >
              {QUICK_MEALS.map((m) => (
                <Chip
                  key={m.name}
                  label={`${m.name} · ${m.kcal}`}
                  role="button"
                  icon={Plus}
                  onPress={() => logMeal(m.name, m.kcal)}
                />
              ))}
            </View>
            <Text variant="label" color="secondary">
              Pick a quick option or add your own.
            </Text>
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: spacing['3'],
                alignItems: 'flex-start',
              }}
            >
              <View style={{ flex: 2, minWidth: 140 }}>
                <Input
                  label="Meal"
                  value={name}
                  onChangeText={setName}
                  placeholder="e.g. Veggie wrap"
                  returnKeyType="next"
                />
              </View>
              <View style={{ flex: 1, minWidth: 90 }}>
                <Input
                  label="kcal"
                  value={kcal}
                  onChangeText={setKcal}
                  keyboardType="number-pad"
                  inputMode="numeric"
                  placeholder="350"
                  onSubmitEditing={() => logMeal(name, Number(kcal))}
                />
              </View>
            </View>
            {err ? (
              <Text variant="caption" color="danger" accessibilityRole="alert">
                {err}
              </Text>
            ) : null}
            <Button label="Add meal" leftIcon={Flame} onPress={() => logMeal(name, Number(kcal))} />
          </Card>

          <MealHistory
            onRemove={(meal) => {
              removeMeal(meal.id);
              add({ kcalEaten: -meal.kcal }, meal.day);
              setNotice({ message: `${meal.name} removed.`, removed: meal });
              announce(`${meal.name} removed. Undo is available.`);
            }}
          />
        </ResponsiveGrid>
      </View>
    </Screen>
  );
}
