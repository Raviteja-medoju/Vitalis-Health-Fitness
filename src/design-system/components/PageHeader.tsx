import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Text } from './Text';
import { BotanicalMark } from './BotanicalMark';

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: React.ReactNode;
}) {
  const { colors, spacing } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: spacing['4'],
        paddingBottom: spacing['5'],
        borderBottomWidth: 1,
        borderColor: colors.border.default,
      }}
    >
      <View
        style={{
          flexGrow: 1,
          flexShrink: 1,
          flexBasis: 180,
          minWidth: 0,
          gap: spacing['2'],
        }}
      >
        {eyebrow ? (
          <Text
            variant="caption"
            color="brand"
            style={{ letterSpacing: 1.8, textTransform: 'uppercase' }}
          >
            {eyebrow}
          </Text>
        ) : null}
        <Text variant="display" heading={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text color="secondary" style={{ maxWidth: 560 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {action ?? <BotanicalMark size={52} />}
    </View>
  );
}
