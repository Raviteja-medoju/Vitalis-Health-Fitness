import { AlertTriangle, CheckCircle2, Info, XCircle, type LucideIcon } from 'lucide-react-native';
import React from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { Icon } from './Icon';
import { Text } from './Text';

export type BannerTone = 'info' | 'success' | 'warning' | 'danger';

export interface BannerProps {
  tone?: BannerTone;
  title?: string;
  message: string;
  icon?: LucideIcon;
  style?: StyleProp<ViewStyle>;
  /** Announce politely to screen readers when it appears. */
  live?: boolean;
}

export function Banner({ tone = 'info', title, message, icon, style, live }: BannerProps) {
  const { colors, radii, spacing, sizes } = useTheme();
  const map: Record<BannerTone, { bg: string; fg: string; icon: LucideIcon }> = {
    info: { bg: colors.bg.brandSubtle, fg: colors.fg.brand, icon: Info },
    success: { bg: colors.bg.successSubtle, fg: colors.fg.success, icon: CheckCircle2 },
    warning: { bg: colors.bg.warningSubtle, fg: colors.fg.warning, icon: AlertTriangle },
    danger: { bg: colors.bg.dangerSubtle, fg: colors.fg.danger, icon: XCircle },
  };
  const t = map[tone];
  return (
    <View
      accessibilityRole={tone === 'danger' || tone === 'warning' ? 'alert' : undefined}
      accessibilityLiveRegion={live ? 'polite' : 'none'}
      style={[
        {
          flexDirection: 'row',
          gap: spacing['3'],
          padding: spacing['3'],
          borderRadius: radii.md,
          backgroundColor: t.bg,
          alignItems: 'flex-start',
        },
        style,
      ]}
    >
      <Icon icon={icon ?? t.icon} size={sizes.iconMd} color={t.fg} />
      <View style={{ flex: 1, gap: 2 }}>
        {title ? (
          <Text variant="bodyStrong" color={t.fg}>
            {title}
          </Text>
        ) : null}
        <Text variant="label" color="secondary" style={{ fontWeight: '400' }}>
          {message}
        </Text>
      </View>
    </View>
  );
}
