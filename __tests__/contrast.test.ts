import {
  contrastRatio,
  meetsContrast,
  pickReadable,
  relativeLuminance,
} from '@/design-system/a11y/contrast';
import { semanticColors } from '@/design-system/tokens/generated';

describe('contrast utilities (WCAG 2.1)', () => {
  it('computes luminance for black and white', () => {
    expect(relativeLuminance('#000000')).toBeCloseTo(0, 5);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
  });

  it('computes 21:1 for black on white and is symmetric', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });

  it('supports 3-digit hex', () => {
    expect(contrastRatio('#000', '#fff')).toBeCloseTo(21, 1);
  });

  it('meetsContrast applies AA thresholds', () => {
    expect(meetsContrast('#767676', '#FFFFFF', 'text')).toBe(true); // 4.54:1
    expect(meetsContrast('#8E9B95', '#FFFFFF', 'text')).toBe(false);
    expect(meetsContrast('#949494', '#FFFFFF', 'text')).toBe(false);
    expect(meetsContrast('#949494', '#FFFFFF', 'ui')).toBe(true);
  });

  it('pickReadable chooses the higher-contrast foreground', () => {
    expect(pickReadable('#0F766E', ['#000000', '#FFFFFF'])).toBe('#FFFFFF');
    expect(pickReadable('#F6F8F7', ['#000000', '#FFFFFF'])).toBe('#000000');
  });

  it.each(['light', 'dark'] as const)('%s mode: body text and primary button meet AA', (mode) => {
    const c = semanticColors[mode];
    expect(contrastRatio(c.fg.primary, c.bg.canvas)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.fg.secondary, c.bg.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.fg.muted, c.bg.surface)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.fg.onBrand, c.action.primary)).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(c.border.focus, c.bg.canvas)).toBeGreaterThanOrEqual(3);
  });
});
