# Accessibility (WCAG 2.1 AA)

Target: **WCAG 2.1 Level AA** on iOS (VoiceOver), Android (TalkBack) and Web (NVDA/VoiceOver + keyboard).

## What is enforced automatically

| Check                                                                    | Where                                                                                  | Criterion     |
| ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- | ------------- |
| Contrast of every semantic text pair ≥ 4.5:1, UI pairs ≥ 3:1, both modes | `npm run a11y:contrast` (CI gate)                                                      | 1.4.3, 1.4.11 |
| Chart palette distinguishable under protan/deutan/tritan vision          | dataviz validator (run when `data.*` tokens change)                                    | 1.4.1         |
| Components expose role/name/state                                        | RNTL tests in `__tests__/components.test.tsx`                                          | 4.1.2         |
| Font scaling                                                             | `Text` passes `maxFontSizeMultiplier` per variant; layouts use flex, not fixed heights | 1.4.4         |
| Touch targets ≥ 44×44 pt                                                 | `MIN_TOUCH`, `hitSlopFor`, enforced in Button/IconButton/Chip/ListItem                 | 2.5.5         |
| Focus visible (web/keyboard)                                             | 2 px `border.focus` ring on all pressables (3:1 vs surfaces)                           | 2.4.7         |
| Reduce Motion                                                            | all motion helpers honour OS setting + in-app override                                 | 2.3.3         |

## Patterns used in the app

- **Headings**: `Text heading={1|2}` sets `accessibilityRole="header"` and `aria-level` on web, so screen-reader users can navigate by heading.
- **Live regions**: goal reached, water logged, workout step changes and coach replies are announced with `announce()`; validation errors use `accessibilityRole="alert"` + `accessibilityLiveRegion="polite"`.
- **Progress**: rings and bars are `progressbar` with `accessibilityValue {min,max,now,text}`; the three-ring hero is a single `summary` element that reads all three values in one swipe.
- **Grouping**: filter rows are `radiogroup` with `radio` children; multi-select chips are `checkbox`.
- **Decorative icons** are hidden (`importantForAccessibility="no-hide-descendants"`); meaningful ones get a label through `Icon accessibilityLabel`.
- **Charts** ship a table view toggle and a full-text summary label, so no information is color- or vision-only.
- **Forms**: label is programmatically associated; helper/error text is referenced via `aria-describedby`; inputs declare `inputMode`/`autoComplete`.

## Manual audit checklist (run per release)

1. iOS VoiceOver: swipe through Onboarding → Today → Workout session → Coach. Every control has a name; order is logical; nothing is unreachable.
2. Android TalkBack: same flow; verify `announce()` messages are heard once.
3. Web keyboard only: tab order, visible focus, Enter/Space activate, Esc closes modals.
4. Dynamic Type at the largest accessibility size: no clipped text, no overlapping controls.
5. Reduce Motion on: no scale/slide animations; rings fill instantly.
6. Dark mode: re-check the gallery screen; CI already verifies contrast.
7. Color-blindness simulation (Figma plugin or Sim Daltonism): rings and bars remain distinguishable; labels carry meaning.

## Remediation log

| Date       | Issue                                                                                    | Fix                                                                               |
| ---------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| 2026-11-13 | Dark-mode chart tints (`data.hydration`, `data.sleep`) failed protan separation (ΔE 1.3) | Re-stepped dark data palette; all four slots now pass the validator in both modes |
