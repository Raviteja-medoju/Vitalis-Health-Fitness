import { CheckCircle2, X } from 'lucide-react-native';
import React from 'react';
import { View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Button } from './Button';
import { IconButton } from './IconButton';
import { Text } from './Text';

export function ActionNotice({
  message,
  onDismiss,
  onUndo,
}: {
  message: string;
  onDismiss: () => void;
  onUndo?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        backgroundColor: colors.bg.successSubtle,
        borderRadius: 16,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
      }}
    >
      <CheckCircle2 size={20} color={colors.fg.success} />
      <Text variant="label" accessibilityLiveRegion="polite" style={{ flex: 1, minWidth: 100 }}>
        {message}
      </Text>
      {onUndo ? <Button label="Undo" variant="ghost" size="sm" onPress={onUndo} /> : null}
      <IconButton icon={X} size={16} accessibilityLabel="Dismiss message" onPress={onDismiss} />
    </View>
  );
}
