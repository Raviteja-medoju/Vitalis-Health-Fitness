# Vitalis Design System

One source of truth for design and code, governed so changes are deliberate, reviewed and traceable.

## Artistic direction

Vitalis uses a botanical editorial theme: warm paper surfaces, forest-green actions, terracotta accents, and softly asymmetric cards. The dark mode uses deep green ink with warm, light foregrounds. These are the default palettes for all screens.

Display, title, and headline text use Georgia on iOS/web and the platform serif on Android. Body copy, controls, and metrics use the system sans-serif for readability; no font downloads are required. The landing headline pairs the editorial face with an italic accent.

`BotanicalMark`, `BotanicalBackdrop`, and `WorkoutVisual` provide vector ink and paper-collage details. `illustration.*` pigments are decorative only: never use them for text, status, or controls. Text over collage artwork sits on opaque semantic surfaces; workout-poster text uses the contrast-audited `artwork.*` pairs. Decorative artwork is hidden from assistive technology and cannot intercept touches.

The theme retains the existing scroll perspective, card depth, and reduced-motion behavior.

## Token architecture

| Tier              | Location                  | Examples                                                                | Who changes it                      |
| ----------------- | ------------------------- | ----------------------------------------------------------------------- | ----------------------------------- |
| **1 · Primitive** | `tokens.json → primitive` | `color.brand.700`, `space.4`, `radius.md`, `duration.base`              | Design system team only             |
| **2 · Semantic**  | `tokens.json → semantic`  | `color.bg.surface`, `color.fg.muted`, `color.action.primary` (per mode) | Design system team, with a11y audit |
| **3 · Component** | `tokens.json → component` | `button.heightMd`, `card.radius`, `ring.strokeWidth`                    | Component owners                    |

- Source file: [`src/design-system/tokens/tokens.json`](../src/design-system/tokens/tokens.json), in the **W3C Design Tokens (DTCG)** format. Figma Variables import/export this format directly (natively, or via Tokens Studio), so the same file round-trips with the Figma library.
- Build: `npm run tokens:build` generates `generated.ts` (typed, tree-shakeable). CI runs `tokens:check` so a stale build cannot merge.
- Modes: every semantic color carries `$extensions.modes.{light,dark}`; these map 1:1 to Figma Variable modes.
- Runtime: `useTheme()` returns the resolved theme. Components never import primitives directly, and raw hex in screens is lint-warned (`no-restricted-syntax`).

## Component library (parity with Figma)

The Figma component set and the code library share **names, variants and states**:

| Figma component   | Code               | Variants / states                                                                  |
| ----------------- | ------------------ | ---------------------------------------------------------------------------------- |
| Button            | `Button`           | primary · secondary · ghost · danger / sm · md · lg / loading · disabled · focused |
| Icon Button       | `IconButton`       | plain · tonal · filled                                                             |
| Card              | `Card`             | surface · subtle · brand · outline / elevated / pressable                          |
| Chip              | `Chip`             | checkbox · radio · button / selected · disabled                                    |
| Segmented Control | `SegmentedControl` | n segments / selected                                                              |
| Input             | `Input`            | default · focused · error · disabled / helper · suffix                             |
| Progress Ring     | `ProgressRing`     | sm · md · lg / color                                                               |
| Progress Bar      | `ProgressBar`      |                                                                                    |
| Stat Tile         | `StatTile`         | with icon · with progress · pressable                                              |
| List Item         | `ListItem`         | with icon · with chevron · with trailing control                                   |
| Banner            | `Banner`           | info · success · warning · danger                                                  |
| Skeleton          | `Skeleton`         |                                                                                    |
| Screen            | `Screen`           | scroll · fixed / footer                                                            |

The in-app **Design system gallery** (Profile → Design system) renders every component in every state in both modes. Use it in design reviews and for manual accessibility passes; it is the living equivalent of the Figma "Components" page.

Auto-layout mapping: Figma auto-layout gap/padding values are restricted to the `space` scale (4-pt grid); code uses the same scale via `spacing[...]`. Hug/fill behaviour maps to `alignSelf: 'flex-start' | 'stretch'` (`fullWidth` on Button).

## Motion

Durations and easings are tokens (`duration.*`, `easing.*`), so Figma Smart Animate timings and code use identical values. Presets live in `src/design-system/motion`:

- `usePressScale` for press feedback (scale 0.97 spring; opacity-only under Reduce Motion)
- `enter.fadeUp(index)` for staggered list/card entrances (capped at 8 items)
- `useAnimatedProgress` for rings/bars (instant under Reduce Motion)
- `spring.bouncy` for celebratory moments (goal reached)

Every helper checks `useReducedMotion()`; the Profile screen exposes an in-app override.

## Governance

1. **Proposals**: a token or component change starts as a Figma branch + a PR. The PR must include the updated `tokens.json`, regenerated `generated.ts`, and a screenshot from the gallery screen in light and dark.
2. **Required checks (CI)**: `tokens:check`, `a11y:contrast` (WCAG 2.1 AA for all semantic pairs), lint, typecheck, tests.
3. **Review**: one design-system engineer + one designer approve. Breaking changes (renamed/removed tokens or props) require a deprecation period of one release with a console warning.
4. **Versioning**: semver on the design system folder (`CHANGELOG` section in release notes). Figma library version tag matches the git tag.
5. **Contribution rules**:
   - No new primitive colors without a documented role.
   - New semantic colors must be added to the contrast audit pair list.
   - Every interactive component must ship with `accessibilityRole`, state, a 44-pt target and a focus style.
   - Every component ships with at least one RNTL test asserting its accessibility contract.

## Adding a token (walkthrough)

```bash
# 1. Edit src/design-system/tokens/tokens.json (add to the right tier; add modes if semantic)
# 2. Regenerate + audit
npm run tokens:build && npm run a11y:contrast
# 3. If it's a semantic color, add a pair to scripts/check-contrast.mjs
# 4. Import the same tokens.json into the Figma library (Variables → Import)
```
