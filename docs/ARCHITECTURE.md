# Architecture

```
src/
  app/                   Expo Router routes (file-based). Layouts own providers & navigators.
    (onboarding)/        5-step registration funnel
    (tabs)/              Today · Workouts · Coach · Nutrition · You
    workout/[id]         Detail  →  workout/session/[id]  (guided player, full-screen modal)
    insights             Weekly charts (modal)
    design-system        Living component gallery (modal)
  design-system/
    tokens/              tokens.json (DTCG, Figma-compatible) → generated.ts
    theme/               ThemeProvider, useTheme, typography scale, elevation
    components/          Accessible, token-driven primitives
    motion/              Reanimated presets honouring Reduce Motion
    a11y/                Contrast maths, announce(), focus helpers, touch-target constants
  features/              Vertical slices: store (zustand + AsyncStorage persist) + UI pieces
    onboarding · activity · workouts · nutrition · coach · insights · profile
  analytics/             Typed event taxonomy, core, adapters (console / HTTP batch / Hotjar), ScreenTracker
  experiments/           Registry, deterministic assignment, exposure logging, QA overrides
  lib/                   storage, date, id/hash utilities
server/                  Node 22 + @anthropic-ai/sdk: SSE streaming coach endpoint (holds the API key)
scripts/                 build-tokens.mjs · check-contrast.mjs
__tests__/               Jest (jest-expo) + React Native Testing Library
.github/workflows/       CI: tokens → a11y → format → lint → types → tests → web export → (EAS)
```

## Key decisions

| Decision                                  | Why                                                                                                                                                                                               |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Expo SDK 58 + Expo Router**             | One codebase for iOS, Android and Web with file-based routing, typed routes, OTA updates via EAS.                                                                                                 |
| **Zustand + AsyncStorage**                | Tiny, testable stores; offline-first by default; `partialize` keeps persisted state small.                                                                                                        |
| **Design tokens in DTCG JSON**            | Native interchange format with Figma Variables; generated TS keeps types strict and tree-shakeable.                                                                                               |
| **Reanimated 4 for motion**               | Runs on the UI thread; `useReducedMotion` built in; entering/exiting presets map to Figma Smart Animate timings.                                                                                  |
| **react-native-svg for rings/charts**     | Cross-platform vector drawing with animated props; no heavy charting dependency.                                                                                                                  |
| **Coach via backend proxy**               | The Anthropic key never ships in the bundle; server adds rate limiting, prompt caching, action validation and a refusal fallback. The app degrades to an on-device rule-based coach when offline. |
| **Analytics adapters**                    | Vendor-neutral core keeps SDKs out of the bundle; Hotjar only on web and only after consent.                                                                                                      |
| **Deterministic client-side experiments** | Works offline and on first launch; exposure-logged; trivially replaceable by remote config.                                                                                                       |

## Data flow for the Coach

1. `useCoachContext()` snapshots profile + today's metrics + catalogue.
2. `coachStore.send()` appends the user turn and a streaming assistant draft, then calls `streamCoachReply()`.
3. Server: sanitises history, injects `<context>` into the last user turn (keeps the system prompt byte-stable for prompt caching), streams `token` events, strips the trailing `ACTIONS:` line, validates it against the catalogue and emits an `actions` event.
4. Client renders tokens live; actions become buttons (start workout, log water, open insights) which call the same store functions the UI uses.
5. Any failure → `fallbackReply()` so the user always gets an answer; the reply is labelled "Offline tip".

## Replacing demo data with real sensors

`features/activity/store.ts` exposes `add()`/`setSleep()`; `seedDemo()` is a stand-in for a HealthKit / Health Connect sync. Replace it with a background task that reads steps, active energy and sleep, and calls `add()` with deltas.
