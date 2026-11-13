import { Platform } from 'react-native';

import {
  componentTokens,
  primitive,
  semanticColors,
  type ColorScheme,
  type SemanticColors,
} from '../tokens/generated';

export type { ColorScheme, SemanticColors };

export type TypographyVariant =
  | 'display'
  | 'title'
  | 'headline'
  | 'subhead'
  | 'body'
  | 'bodyStrong'
  | 'label'
  | 'caption'
  | 'metric'
  | 'metricSm';

export interface TypeStyle {
  fontFamily?: string;
  fontSize: number;
  lineHeight: number;
  fontWeight: '400' | '500' | '600' | '700';
  letterSpacing?: number;
  /** Cap on OS font scaling so layouts stay usable at the largest sizes (WCAG 1.4.4 still met). */
  maxFontSizeMultiplier: number;
}

const lh = (size: number, ratio: number) => Math.round(size * ratio);

export const fontFamilies = {
  editorial: Platform.select({
    web: 'Georgia, "Times New Roman", serif',
    ios: 'Georgia',
    default: 'serif',
  }),
  body: Platform.select({
    web: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    ios: 'System',
    default: 'sans-serif',
  }),
};

export const typography: Record<TypographyVariant, TypeStyle> = {
  display: {
    fontFamily: fontFamilies.editorial,
    fontSize: primitive.fontSize['3xl'],
    lineHeight: lh(primitive.fontSize['3xl'], primitive.lineHeight.tight),
    fontWeight: '400',
    letterSpacing: -0.5,
    maxFontSizeMultiplier: 1.4,
  },
  title: {
    fontFamily: fontFamilies.editorial,
    fontSize: primitive.fontSize['2xl'],
    lineHeight: lh(primitive.fontSize['2xl'], primitive.lineHeight.tight),
    fontWeight: '400',
    letterSpacing: -0.3,
    maxFontSizeMultiplier: 1.6,
  },
  headline: {
    fontFamily: fontFamilies.editorial,
    fontSize: primitive.fontSize.xl,
    lineHeight: lh(primitive.fontSize.xl, primitive.lineHeight.snug),
    fontWeight: '400',
    maxFontSizeMultiplier: 1.8,
  },
  subhead: {
    fontSize: primitive.fontSize.lg,
    lineHeight: lh(primitive.fontSize.lg, primitive.lineHeight.snug),
    fontWeight: '600',
    maxFontSizeMultiplier: 2,
  },
  body: {
    fontFamily: fontFamilies.body,
    fontSize: primitive.fontSize.md,
    lineHeight: lh(primitive.fontSize.md, primitive.lineHeight.normal),
    fontWeight: '400',
    maxFontSizeMultiplier: 2,
  },
  bodyStrong: {
    fontSize: primitive.fontSize.md,
    lineHeight: lh(primitive.fontSize.md, primitive.lineHeight.normal),
    fontWeight: '600',
    maxFontSizeMultiplier: 2,
  },
  label: {
    fontSize: primitive.fontSize.sm,
    lineHeight: lh(primitive.fontSize.sm, primitive.lineHeight.snug),
    fontWeight: '500',
    maxFontSizeMultiplier: 2,
  },
  caption: {
    fontSize: primitive.fontSize.xs,
    lineHeight: lh(primitive.fontSize.xs, primitive.lineHeight.snug),
    fontWeight: '400',
    maxFontSizeMultiplier: 2,
  },
  metric: {
    fontSize: primitive.fontSize['4xl'],
    lineHeight: lh(primitive.fontSize['4xl'], primitive.lineHeight.tight),
    fontWeight: '700',
    letterSpacing: -1,
    maxFontSizeMultiplier: 1.3,
  },
  metricSm: {
    fontSize: primitive.fontSize.xl,
    lineHeight: lh(primitive.fontSize.xl, primitive.lineHeight.tight),
    fontWeight: '700',
    letterSpacing: -0.3,
    maxFontSizeMultiplier: 1.5,
  },
};

// Keep reading text and form fields at 16px; scale down editorial headings and metrics on phones.
const compactTypography: typeof typography = {
  ...typography,
  display: { ...typography.display, fontSize: 28, lineHeight: 33 },
  title: { ...typography.title, fontSize: 24, lineHeight: 29 },
  headline: { ...typography.headline, fontSize: 20, lineHeight: 26 },
  subhead: { ...typography.subhead, fontSize: 17, lineHeight: 23 },
  metric: { ...typography.metric, fontSize: 36, lineHeight: 42 },
  metricSm: { ...typography.metricSm, fontSize: 20, lineHeight: 24 },
};

export const spacing = primitive.space;
export const radii = primitive.radius;
export const sizes = primitive.size;
export const motionTokens = {
  duration: primitive.duration,
  easing: primitive.easing,
};

export const elevation = {
  none: {},
  sm: Platform.select({
    web: { boxShadow: '0 1px 2px rgba(11,18,16,0.06), 0 1px 1px rgba(11,18,16,0.04)' },
    default: {
      shadowColor: primitive.color['neutral.950'],
      shadowOpacity: 0.06,
      shadowRadius: 2,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
  }) as object,
  md: Platform.select({
    web: { boxShadow: '0 6px 16px rgba(11,18,16,0.08), 0 2px 4px rgba(11,18,16,0.04)' },
    default: {
      shadowColor: primitive.color['neutral.950'],
      shadowOpacity: 0.1,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 4,
    },
  }) as object,
};

export interface Theme {
  scheme: ColorScheme;
  compact: boolean;
  isDark: boolean;
  colors: SemanticColors;
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  typography: typeof typography;
  motion: typeof motionTokens;
  elevation: typeof elevation;
  component: typeof componentTokens;
}

export function createTheme(scheme: ColorScheme, compact = false): Theme {
  return {
    scheme,
    compact,
    isDark: scheme === 'dark',
    colors: semanticColors[scheme],
    spacing,
    radii,
    sizes,
    typography: compact ? compactTypography : typography,
    motion: motionTokens,
    elevation,
    component: componentTokens,
  };
}

export const lightTheme = createTheme('light');
export const darkTheme = createTheme('dark');
