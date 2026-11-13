import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  useWindowDimensions,
  View,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';

export interface ScreenProps extends ScrollViewProps {
  /** Use a plain View (no scrolling) for list-based screens that manage their own scroll. */
  scroll?: boolean;
  padded?: boolean;
  wide?: boolean;
  /** Extra bottom padding for a sticky footer. */
  footer?: React.ReactNode;
  edges?: { top?: boolean; bottom?: boolean };
  children?: React.ReactNode;
}

/** Page container: safe areas, max content width on large screens, keyboard handling. */
export function Screen({
  scroll = true,
  padded = true,
  wide = false,
  footer,
  edges = { top: true, bottom: true },
  children,
  contentContainerStyle,
  style,
  ...rest
}: ScreenProps) {
  const { colors, spacing } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const maxWidth = wide ? 1120 : 680;
  const gutter = width < 380 ? 16 : width < 768 ? 24 : 32;

  const pad: ViewStyle = {
    paddingHorizontal: padded ? gutter : 0,
    paddingTop: (edges.top ? insets.top : 0) + (padded ? gutter : 0),
    paddingBottom: (edges.bottom && !footer ? insets.bottom : 0) + (padded ? spacing['6'] : 0),
  };

  const content = scroll ? (
    <ScrollView
      {...rest}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentInsetAdjustmentBehavior="automatic"
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        pad,
        { width: '100%', maxWidth, alignSelf: 'center', flexGrow: 1 },
        contentContainerStyle,
      ]}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, pad, { width: '100%', maxWidth, alignSelf: 'center' }, style]}>
      {children}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: colors.bg.canvas }}
    >
      {content}
      {footer ? (
        <View
          style={{
            paddingHorizontal: spacing['4'],
            paddingTop: spacing['3'],
            paddingBottom: insets.bottom + spacing['3'],
            backgroundColor: colors.bg.canvas,
            borderTopWidth: 1,
            borderTopColor: colors.border.default,
            width: '100%',
            maxWidth,
            alignSelf: 'center',
          }}
        >
          {footer}
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}
