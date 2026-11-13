import React from 'react';
import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import type { SemanticColors, TypographyVariant } from '../theme/theme';

type FgColor = keyof SemanticColors['fg'];

export interface TextProps extends RNTextProps {
  variant?: TypographyVariant;
  /** Semantic foreground token (preferred) or any string color for data viz. */
  color?: FgColor | (string & {});
  align?: TextStyle['textAlign'];
  /** Marks the text as a heading for screen readers (web: h1-h6 via aria-level). */
  heading?: 1 | 2 | 3 | 4 | 5 | 6;
  children?: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = 'primary',
  align,
  heading,
  style,
  children,
  ...rest
}: TextProps) {
  const { colors, typography } = useTheme();
  const t = typography[variant];
  const fg = (colors.fg as Record<string, string>)[color] ?? color;

  return (
    <RNText
      {...rest}
      accessibilityRole={heading ? 'header' : rest.accessibilityRole}
      aria-level={heading}
      maxFontSizeMultiplier={rest.maxFontSizeMultiplier ?? t.maxFontSizeMultiplier}
      style={[
        {
          color: fg,
          fontSize: t.fontSize,
          fontFamily: t.fontFamily ?? typography.body.fontFamily,
          lineHeight: t.lineHeight,
          fontWeight: t.fontWeight,
          letterSpacing: t.letterSpacing,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </RNText>
  );
}
