import { Droplets, Flame, Footprints } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Card, Icon, ProgressRing, Text, useTheme } from '@/design-system';
import { formatNumber } from '@/lib/date';
import { DepthSurface } from '@/design-system/motion/DepthSurface';

import type { DayMetrics } from './store';

interface Props {
  metrics: DayMetrics;
  targets: { steps: number; activeMinutes: number; waterMl: number };
}

/** Three concentric rings: steps (move), active minutes (energy), water (hydration). */
export function RingsHero({ metrics, targets }: Props) {
  const { colors, spacing, component } = useTheme();
  const steps = metrics.steps / targets.steps;
  const active = metrics.activeMinutes / targets.activeMinutes;
  const water = metrics.waterMl / targets.waterMl;
  const big = component.ring.sizeLg + 20;
  const sw = component.ring.strokeWidth;

  const legend = [
    {
      icon: Footprints,
      label: 'Steps',
      value: `${formatNumber(metrics.steps)} / ${formatNumber(targets.steps)}`,
      color: colors.data.move,
      pct: steps,
    },
    {
      icon: Flame,
      label: 'Active',
      value: `${metrics.activeMinutes} / ${targets.activeMinutes} min`,
      color: colors.data.energy,
      pct: active,
    },
    {
      icon: Droplets,
      label: 'Water',
      value: `${formatNumber(metrics.waterMl)} / ${formatNumber(targets.waterMl)} ml`,
      color: colors.data.hydration,
      pct: water,
    },
  ];

  return (
    <DepthSurface style={{ flex: 1 }}>
      <Card
        elevated
        style={{
          flex: 1,
          justifyContent: 'space-between',
          gap: spacing['4'],
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            gap: spacing['4'],
            flexGrow: 1,
          }}
        >
          <View
            accessible
            accessibilityRole="summary"
            accessibilityLabel={`Today's rings. ${legend.map((l) => `${l.label} ${Math.round(l.pct * 100)} percent, ${l.value}`).join('. ')}`}
            style={{ width: big, height: big, alignItems: 'center', justifyContent: 'center' }}
          >
            <ProgressRing
              value={steps}
              size={big}
              strokeWidth={sw}
              color={colors.data.move}
              accessibilityLabel="Steps"
              style={{ position: 'absolute' }}
            />
            <ProgressRing
              value={active}
              size={big - (sw + 4) * 2}
              strokeWidth={sw}
              color={colors.data.energy}
              accessibilityLabel="Active minutes"
              style={{ position: 'absolute' }}
            />
            <ProgressRing
              value={water}
              size={big - (sw + 4) * 4}
              strokeWidth={sw}
              color={colors.data.hydration}
              accessibilityLabel="Water"
              style={{ position: 'absolute' }}
            />
            <View style={{ alignItems: 'center' }}>
              <Text variant="metricSm">{Math.round(steps * 100)}%</Text>
              <Text variant="caption" color="muted">
                steps
              </Text>
            </View>
          </View>
          <View
            style={{ flex: 1, minWidth: 130, gap: spacing['3'] }}
            importantForAccessibility="no-hide-descendants"
            accessibilityElementsHidden
          >
            {legend.map((l) => (
              <View
                key={l.label}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing['2'] }}
              >
                <Icon icon={l.icon} size={18} color={l.color} />
                <View style={{ flex: 1 }}>
                  <Text variant="caption" color="secondary">
                    {l.label}
                  </Text>
                  <Text variant="label">{l.value}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
        <View
          style={{ borderTopWidth: 1, borderColor: colors.border.default, paddingTop: 16, gap: 8 }}
        >
          <Text variant="bodyStrong">
            {legend.filter((item) => item.pct >= 1).length} of 3 daily goals reached
          </Text>
          <Text variant="caption" color="secondary">
            {metrics.steps >= targets.steps
              ? 'Step goal complete. Every extra step is a bonus.'
              : `${formatNumber(Math.max(0, targets.steps - metrics.steps))} more steps to close your move ring.`}
          </Text>
        </View>
      </Card>
    </DepthSurface>
  );
}
