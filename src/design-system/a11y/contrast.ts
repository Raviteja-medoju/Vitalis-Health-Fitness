/**
 * WCAG 2.1 contrast utilities (SC 1.4.3, 1.4.6, 1.4.11).
 * Pure functions; shared by runtime checks, tests and scripts/check-contrast.mjs.
 */

export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '').slice(0, 6);
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  const n = parseInt(full, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

export type ContrastLevel = 'AA' | 'AAA';
export type ContrastUse = 'text' | 'largeText' | 'ui';

const thresholds: Record<ContrastLevel, Record<ContrastUse, number>> = {
  AA: { text: 4.5, largeText: 3, ui: 3 },
  AAA: { text: 7, largeText: 4.5, ui: 3 },
};

export function meetsContrast(
  fg: string,
  bg: string,
  use: ContrastUse = 'text',
  level: ContrastLevel = 'AA',
): boolean {
  return contrastRatio(fg, bg) >= thresholds[level][use];
}

/** Pick whichever candidate foreground has the better contrast against bg. */
export function pickReadable(bg: string, candidates: readonly string[]): string {
  let best = candidates[0] ?? '#000000';
  let bestRatio = 0;
  for (const c of candidates) {
    const r = contrastRatio(c, bg);
    if (r > bestRatio) {
      best = c;
      bestRatio = r;
    }
  }
  return best;
}
