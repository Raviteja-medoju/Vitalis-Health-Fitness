#!/usr/bin/env node
/**
 * WCAG 2.1 AA contrast audit for semantic color pairs, in both color modes.
 * Fails CI when any required pair falls below threshold:
 *   - text pairs:        4.5:1  (SC 1.4.3 Contrast (Minimum))
 *   - UI / graphic pairs: 3.0:1  (SC 1.4.11 Non-text Contrast)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const genPath = path.resolve(here, '../src/design-system/tokens/generated.ts');
const src = fs.readFileSync(genPath, 'utf8');
const m = src.match(/export const semanticColors = ([\s\S]*?) as const;/);
if (!m) throw new Error('semanticColors not found; run tokens:build first');
const semantic = JSON.parse(m[1]);

function hexToRgb(hex) {
  const h = hex.replace('#', '').slice(0, 6);
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255);
}
function lum(hex) {
  const [r, g, b] = hexToRgb(hex).map((c) =>
    c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function ratio(a, b) {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

const TEXT = 4.5;
const UI = 3;
// [foreground, background, minimum]
const pairs = [
  ...['strength', 'cardio', 'mobility', 'mindfulness'].flatMap((category) => [
    [`artwork.${category}Ink`, `artwork.${category}Bg`, TEXT],
    ['artwork.text', `artwork.${category}Bg`, TEXT],
  ]),
  ['fg.primary', 'bg.canvas', TEXT],
  ['fg.primary', 'bg.surface', TEXT],
  ['fg.primary', 'bg.subtle', TEXT],
  ['fg.primary', 'bg.elevated', TEXT],
  ['fg.secondary', 'bg.canvas', TEXT],
  ['fg.secondary', 'bg.surface', TEXT],
  ['fg.secondary', 'bg.subtle', TEXT],
  ['fg.muted', 'bg.canvas', TEXT],
  ['fg.muted', 'bg.surface', TEXT],
  ['fg.muted', 'bg.subtle', TEXT],
  ['fg.brand', 'bg.surface', TEXT],
  ['fg.brand', 'bg.canvas', TEXT],
  ['fg.brand', 'bg.brandSubtle', TEXT],
  ['fg.accent', 'bg.surface', TEXT],
  ['fg.accent', 'bg.accentSubtle', TEXT],
  ['fg.success', 'bg.surface', TEXT],
  ['fg.success', 'bg.successSubtle', TEXT],
  ['fg.warning', 'bg.surface', TEXT],
  ['fg.warning', 'bg.warningSubtle', TEXT],
  ['fg.danger', 'bg.surface', TEXT],
  ['fg.danger', 'bg.dangerSubtle', TEXT],
  ['fg.link', 'bg.surface', TEXT],
  ['fg.onBrand', 'action.primary', TEXT],
  ['fg.onBrand', 'action.primaryPressed', TEXT],
  ['fg.brand', 'action.secondary', TEXT],
  ['fg.brand', 'action.secondaryPressed', TEXT],
  ['fg.onBrand', 'action.danger', TEXT],
  ['action.disabledFg', 'action.disabledBg', TEXT],
  // non-text (3:1)
  ['action.primary', 'bg.surface', UI],
  ['action.primary', 'bg.canvas', UI],
  ['border.focus', 'bg.surface', UI],
  ['border.focus', 'bg.canvas', UI],
  ['border.strong', 'bg.surface', UI],
  ['data.move', 'bg.surface', UI],
  ['data.energy', 'bg.surface', UI],
  ['data.hydration', 'bg.surface', UI],
  ['data.sleep', 'bg.surface', UI],
  ['data.move', 'data.track', UI],
  ['data.energy', 'data.track', UI],
  ['data.hydration', 'data.track', UI],
  ['data.sleep', 'data.track', UI],
];

let failures = 0;
const rows = [];
for (const mode of Object.keys(semantic)) {
  for (const [fgKey, bgKey, min] of pairs) {
    const fg = fgKey.split('.').reduce((o, k) => o[k], semantic[mode]);
    const bg = bgKey.split('.').reduce((o, k) => o[k], semantic[mode]);
    const r = ratio(fg, bg);
    const ok = r >= min;
    if (!ok) failures++;
    rows.push(
      `${ok ? 'PASS' : 'FAIL'} ${mode.padEnd(5)} ${fgKey.padEnd(20)} on ${bgKey.padEnd(22)} ${r
        .toFixed(2)
        .padStart(5)}:1  (min ${min}:1)`,
    );
  }
}
console.log(rows.join('\n'));
console.log(`\n${pairs.length * 2 - failures}/${pairs.length * 2} pairs pass WCAG 2.1 AA`);
if (failures) {
  console.error(`\nFAIL: ${failures} contrast failure(s). Fix tokens.json before merging.`);
  process.exit(1);
}
