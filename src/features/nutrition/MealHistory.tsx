import { Clock, Trash2, Utensils } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Card, IconButton, Text, useTheme } from '@/design-system';
import { formatNumber, lastNDays, todayKey, weekdayShort } from '@/lib/date';

import { type MealEntry, useNutritionStore } from './store';

export function MealHistory({ onRemove }: { onRemove: (meal: MealEntry) => void }) {
  const { colors } = useTheme();
  const allMeals = useNutritionStore((s) => s.meals);
  const [day, setDay] = useState(todayKey());
  const meals = useMemo(() => allMeals.filter((meal) => meal.day === day), [allMeals, day]);
  const total = meals.reduce((sum, meal) => sum + meal.kcal, 0);
  const swatches = [colors.data.move, colors.data.energy, colors.data.hydration, colors.data.sleep];
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
          Food journal
        </Text>
        <Clock size={20} color={colors.fg.muted} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1, gap: 6 }}
      >
        {lastNDays(7)
          .reverse()
          .map((key) => (
            <Pressable
              key={key}
              accessibilityRole="button"
              accessibilityLabel={`Meals for ${key === todayKey() ? 'today' : key}`}
              accessibilityState={{ selected: key === day }}
              aria-pressed={key === day}
              onPress={() => setDay(key)}
              style={({ pressed }) => ({
                minWidth: 44,
                minHeight: 70,
                flex: 1,
                padding: 8,
                borderRadius: 14,
                gap: 6,
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: key === day ? colors.fg.brand : colors.border.default,
                backgroundColor: pressed || key === day ? colors.bg.brandSubtle : colors.bg.surface,
              })}
            >
              <Text variant="caption" color="secondary">
                {weekdayShort(key).slice(0, 1)}
              </Text>
              <Text variant="label" color={key === day ? 'brand' : 'primary'}>
                {Number(key.slice(-2))}
              </Text>
              <View
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: allMeals.some((meal) => meal.day === key)
                    ? colors.fg.brand
                    : 'transparent',
                }}
              />
            </Pressable>
          ))}
      </ScrollView>
      <View accessibilityLiveRegion="polite" style={{ gap: 12 }}>
        <Text variant="label" heading={3}>
          {day === todayKey()
            ? "Today's meals"
            : `Meals · ${new Date(`${day}T12:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`}
        </Text>
        {meals.length ? (
          <>
            <Text variant="caption" color="secondary">
              {meals.length} {meals.length === 1 ? 'entry' : 'entries'} · {formatNumber(total)} kcal
              logged
            </Text>
            <View
              style={{
                flexDirection: 'row',
                height: 8,
                borderRadius: 4,
                overflow: 'hidden',
                gap: 2,
              }}
              accessibilityLabel={`${formatNumber(total)} calories across logged meals`}
            >
              {meals.map((meal, index) => (
                <View
                  key={meal.id}
                  style={{ flex: meal.kcal, backgroundColor: swatches[index % swatches.length] }}
                />
              ))}
            </View>
            {meals.map((meal, index) => (
              <View
                key={meal.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderColor: colors.border.default,
                }}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: swatches[index % swatches.length],
                  }}
                />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text variant="bodyStrong">{meal.name}</Text>
                  <Text variant="caption" color="secondary">
                    {new Date(meal.at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    · {meal.kcal} kcal
                  </Text>
                </View>
                <IconButton
                  icon={Trash2}
                  accessibilityLabel={`Remove ${meal.name}`}
                  onPress={() => onRemove(meal)}
                />
              </View>
            ))}
          </>
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 24, gap: 12 }}>
            <View style={{ padding: 18, borderRadius: 24, backgroundColor: colors.bg.brandSubtle }}>
              <Utensils size={28} color={colors.fg.brand} />
            </View>
            <Text variant="subhead" align="center">
              {day === todayKey() ? 'Your day, one meal at a time' : 'A fresh page in your journal'}
            </Text>
            <Text color="secondary" align="center">
              {day === todayKey()
                ? 'No meals logged today. Choose a quick option or enter a meal to start your daily food journal.'
                : 'No meals were logged on this day. Select another date to explore your history.'}
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
}
