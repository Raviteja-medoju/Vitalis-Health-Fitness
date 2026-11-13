# Figma ↔ Code Handoff

The goal is that a designer and an engineer never argue about a value: the number in Figma _is_ the number in code.

## 1. Variables (tokens)

- Figma Variables are exported as DTCG JSON and committed to `src/design-system/tokens/tokens.json`. The reverse direction (code → Figma) works the same way via _Variables → Import_.
- Collections map to tiers: **Primitive**, **Semantic** (modes: Light, Dark), **Component**.
- Naming is identical: `color/bg/surface` in Figma = `colors.bg.surface` in code.

## 2. Components

- Figma component names match the exported React components (`Button`, `Chip`, `ProgressRing` ...). Variant property names match props (`variant`, `size`, `selected`, `loading`).
- Auto-layout spacing uses the `space` scale only. If a mock needs 18 px, the design is wrong, not the scale.
- The **Design system gallery** screen in the app is the reference render. Open it on device next to the Figma frame.

## 3. Prototypes → motion

- Smart Animate durations in Figma prototypes should use the `duration` tokens (140 / 220 / 360 / 600 ms) and the `easing.standard` curve `cubic-bezier(0.2, 0, 0, 1)`.
- Advanced prototyping with Figma Variables & conditional logic (e.g. goal selection enabling the Continue button) is mirrored 1:1 by component state in code (`nextDisabled={goals.length === 0}`).

## 4. Annotations the engineer needs

For each screen, the Figma file should annotate:

1. **Accessibility names** for icon-only buttons and the reading order.
2. **Live-region messages** (what gets announced when).
3. **Empty, loading, error states** (Skeleton/Banner components exist for these).
4. **Dynamic Type behaviour** at 200%: what wraps, what truncates (`numberOfLines`).
5. **Analytics events** fired by each control (names from `events.ts`).
6. **Experiment variant** if the frame belongs to an arm.

## 5. Handoff checklist (per feature)

- [ ] Tokens only (no detached styles) — Figma lint passes
- [ ] All states designed (default / pressed / focused / disabled / loading / error / empty)
- [ ] Light and dark frames
- [ ] Largest Dynamic Type frame
- [ ] Reduce-Motion note on any animation
- [ ] Events + experiment annotations
- [ ] Linked usability-test findings (Hotjar / remote test recording) that motivated the change
