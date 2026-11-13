import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { Pressable, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export interface ListItemProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconColor?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  chevron?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export function ListItem({
  title,
  subtitle,
  icon,
  iconColor,
  right,
  onPress,
  chevron = Boolean(onPress),
  accessibilityHint,
  style,
  testID,
}: ListItemProps) {
  const { colors, spacing, radii, sizes } = useTheme();
  const [focused, setFocused] = useState(false);
  const content = (
    <>
      {icon ? (
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: radii.sm,
            backgroundColor: colors.bg.subtle,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon icon={icon} size={sizes.iconMd} color={iconColor ?? colors.fg.brand} />
        </View>
      ) : null}
      <View style={{ flex: 1, minWidth: 100, gap: 2 }}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="secondary">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {chevron ? <Icon icon={ChevronRight} size={sizes.iconMd} color={colors.fg.muted} /> : null}
    </>
  );
  const rowStyle: ViewStyle = {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing['3'],
    minHeight: sizes.touchTarget + 12,
    paddingVertical: spacing['2'],
    borderWidth: 2,
    borderColor: focused ? colors.border.focus : 'transparent',
    borderRadius: radii.md,
  };
  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityRole="button"
        accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
        accessibilityHint={accessibilityHint}
        style={({ pressed }) => [rowStyle, { opacity: pressed ? 0.7 : 1 }, style]}
      >
        {content}
      </Pressable>
    );
  }
  return (
    <View testID={testID} style={[rowStyle, style]}>
      {content}
    </View>
  );
}
