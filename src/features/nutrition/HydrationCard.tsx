import { Droplets, GlassWater } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { Button, Card, Text, useTheme } from '@/design-system';
import { formatNumber } from '@/lib/date';

export function HydrationCard({
  amount,
  target,
  onAdd,
}: {
  amount: number;
  target: number;
  onAdd: (ml: number) => void;
}) {
  const { colors } = useTheme();
  const progress = Math.min(1, amount / Math.max(1, target));
  return (
    <Card style={{ flex: 1, gap: 20 }}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Droplets size={22} color={colors.data.hydration} />
        <Text variant="subhead" heading={2}>
          Hydration station
        </Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 8 }}>
        <Text variant="metricSm">{(amount / 1000).toFixed(2)}</Text>
        <Text color="secondary">/ {(target / 1000).toFixed(1)} L</Text>
      </View>
      <View
        accessible
        accessibilityLabel={`${formatNumber(amount)} of ${formatNumber(target)} millilitres, ${Math.round(progress * 100)} percent of water goal`}
        style={{ gap: 12 }}
      >
        <View
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
          aria-hidden
          style={{ flexDirection: 'row', gap: 6 }}
        >
          {Array.from({ length: 8 }, (_, index) => (
            <View
              key={index}
              style={{
                flex: 1,
                minWidth: 24,
                height: 42,
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 10,
                backgroundColor:
                  index < Math.floor(progress * 8) ? colors.bg.brandSubtle : colors.bg.subtle,
              }}
            >
              <GlassWater
                size={24}
                color={index < Math.floor(progress * 8) ? colors.data.hydration : colors.fg.muted}
                strokeWidth={index < Math.floor(progress * 8) ? 2.5 : 1}
              />
            </View>
          ))}
        </View>
        <View
          style={{
            height: 6,
            backgroundColor: colors.data.track,
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${progress * 100}%`,
              height: '100%',
              backgroundColor: colors.data.hydration,
            }}
          />
        </View>
      </View>
      <Text variant="caption" color="secondary">
        {amount >= target
          ? 'Daily goal reached. Nicely done.'
          : `${formatNumber(target - amount)} ml to your daily goal. One sip at a time.`}
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Button
          label="+ 250 ml"
          variant="secondary"
          onPress={() => onAdd(250)}
          style={{ flexGrow: 1 }}
        />
        <Button
          label="+ 500 ml"
          variant="secondary"
          onPress={() => onAdd(500)}
          style={{ flexGrow: 1 }}
        />
      </View>
    </Card>
  );
}
