import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Card, SegmentedControl, Text, useTheme } from '@/design-system';
import { formatNumber, lastNDays, todayKey, weekdayShort } from '@/lib/date';

import { emptyDay, useActivityStore } from './store';

type Metric = 'steps' | 'activeMinutes' | 'waterMl';
const OPTIONS = [
  { value: 'steps' as const, label: 'Steps' },
  { value: 'activeMinutes' as const, label: 'Minutes' },
  { value: 'waterMl' as const, label: 'Water' },
];

export function ActivityWeek() {
  const { colors } = useTheme();
  const days = useActivityStore((s) => s.days);
  const seeded = useActivityStore((s) => s.seeded);
  const [metric, setMetric] = useState<Metric>('steps');
  const [selected, setSelected] = useState(todayKey());
  const chart = useRef<React.ComponentRef<typeof ScrollView>>(null);
  const keys = lastNDays(7);
  const values = keys.map((key) => (days[key] ?? emptyDay)[metric]);
  const max = Math.max(1, ...values);
  const value = (days[selected] ?? emptyDay)[metric];
  const unit =
    metric === 'steps' ? 'steps' : metric === 'activeMinutes' ? 'active min' : 'ml water';
  const tint =
    metric === 'steps'
      ? colors.data.move
      : metric === 'activeMinutes'
        ? colors.data.energy
        : colors.data.hydration;

  return (
    <Card style={{ gap: 16, flex: 1 }}>
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ gap: 4 }}>
          <Text variant="subhead" heading={2}>
            Your weekly rhythm
          </Text>
          <Text variant="caption" color="secondary">
            Tap a day to explore. Swipe to see more days.
          </Text>
        </View>
        <Text variant="caption" color="muted">
          {seeded ? 'Includes demo activity' : 'Last 7 days'}
        </Text>
      </View>
      <SegmentedControl
        accessibilityLabel="Activity metric"
        options={OPTIONS}
        value={metric}
        onChange={setMetric}
      />
      <View
        accessibilityLiveRegion="polite"
        style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 }}
      >
        <Text variant="metricSm">{formatNumber(value)}</Text>
        <Text color="secondary">
          {unit} · {selected === todayKey() ? 'Today' : weekdayShort(selected)}
        </Text>
      </View>
      <ScrollView
        ref={chart}
        horizontal
        showsHorizontalScrollIndicator
        onContentSizeChange={() => chart.current?.scrollToEnd({ animated: false })}
        contentContainerStyle={{ flexGrow: 1, gap: 4 }}
      >
        {keys.map((key, index) => (
          <Pressable
            key={key}
            accessibilityRole="button"
            accessibilityLabel={`${weekdayShort(key)} ${key}, ${formatNumber(values[index] ?? 0)} ${unit}`}
            accessibilityState={{ selected: selected === key }}
            aria-pressed={selected === key}
            onPress={() => setSelected(key)}
            style={({ pressed }) => ({
              flex: 1,
              minWidth: 44,
              padding: 6,
              gap: 8,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: selected === key ? tint : 'transparent',
              backgroundColor: pressed || selected === key ? colors.bg.subtle : 'transparent',
              alignItems: 'center',
            })}
          >
            <View
              style={{
                height: 102,
                width: 20,
                justifyContent: 'flex-end',
                borderRadius: 8,
                backgroundColor: colors.data.track,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: '100%',
                  height: values[index] ? Math.max(3, ((values[index] ?? 0) / max) * 102) : 0,
                  borderRadius: 8,
                  backgroundColor: tint,
                }}
              />
            </View>
            <Text variant="caption" color={selected === key ? 'primary' : 'secondary'}>
              {weekdayShort(key).slice(0, 1)}
            </Text>
            <Text variant="caption" color="secondary">
              {Number(key.slice(-2))}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
      <Text variant="caption" color="secondary">
        {formatNumber(values.reduce((sum, n) => sum + n, 0))} {unit} across the last 7 days
      </Text>
    </Card>
  );
}
