import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Button, Text, enter, useTheme } from '@/design-system';

import type { CoachAction, CoachMessage } from './types';

interface Props {
  message: CoachMessage;
  onAction?: (a: CoachAction) => void;
}

export function MessageBubble({ message, onAction }: Props) {
  const { colors, radii, spacing } = useTheme();
  const mine = message.role === 'user';
  return (
    <Animated.View
      entering={enter.fadeUp(0)}
      accessible
      accessibilityRole="text"
      accessibilityLabel={`${mine ? 'You' : 'Coach'}: ${message.text || (message.streaming ? 'typing' : '')}`}
      style={{ alignItems: mine ? 'flex-end' : 'flex-start', gap: spacing['2'] }}
    >
      <View
        style={{
          maxWidth: '86%',
          backgroundColor: mine ? colors.action.primary : colors.bg.surface,
          borderRadius: radii.lg,
          borderBottomRightRadius: mine ? radii.xs : radii.lg,
          borderBottomLeftRadius: mine ? radii.lg : radii.xs,
          paddingHorizontal: spacing['4'],
          paddingVertical: spacing['3'],
          borderWidth: mine ? 0 : 1,
          borderColor: colors.border.default,
        }}
      >
        <Text variant="body" color={mine ? colors.fg.onBrand : 'primary'}>
          {message.text || (message.streaming ? '…' : '')}
        </Text>
        {!mine && message.source === 'fallback' && message.id !== 'welcome' ? (
          <Text variant="caption" color="muted" style={{ marginTop: spacing['1'] }}>
            Offline tip (coach server not connected)
          </Text>
        ) : null}
      </View>
      {!mine && message.actions?.length ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing['2'] }}>
          {message.actions.map((a) => (
            <Button
              key={`${a.type}-${a.label}`}
              label={a.label}
              size="sm"
              variant="secondary"
              onPress={() => onAction?.(a)}
            />
          ))}
        </View>
      ) : null}
    </Animated.View>
  );
}
