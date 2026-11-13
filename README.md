# Vitalis — Cross-Platform Health & Fitness App

Production-grade reference implementation of the practices in the design brief: mobile-first iOS/Android/Web app with a governed design system, WCAG 2.1 AA accessibility, instrumented onboarding funnel, A/B testing, Hotjar-ready analytics, micro-interactions, and a conversational AI coach powered by Claude.

| Area               | Implementation                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cross-platform     | Expo SDK 58 · React Native 0.88 · Expo Router (iOS, Android, Web from one codebase)                                                                         |
| Design system      | DTCG tokens (Figma Variables-compatible) → typed theme · 15 accessible components · living gallery screen                                                   |
| Accessibility      | CI contrast audit (82 pairs, light + dark) · roles/states/live regions · 44-pt targets · Reduce Motion · Dynamic Type                                       |
| Micro-interactions | Reanimated 4 presets (press, stagger, rings) with token-driven timings matching Figma prototypes                                                            |
| Onboarding         | 5-step funnel with skip paths, validation, progress and per-step drop-off analytics                                                                         |
| Analytics          | Typed event taxonomy · console / HTTP batch / Hotjar adapters · screen tracking · consent buffer                                                            |
| A/B testing        | Deterministic bucketing · exposure logging · QA overrides · 3 live experiments                                                                              |
| AI coach           | Streaming SSE backend on `@anthropic-ai/sdk` (claude-opus-5-5) with prompt caching, refusal fallback, validated in-app actions; offline rule-based fallback |
| Data viz           | Weekly bar charts following validated palette rules, table view, tap-to-inspect                                                                             |
| Quality            | TypeScript strict · ESLint + Prettier · Jest + RNTL · GitHub Actions · EAS profiles                                                                         |

## Quick start

```bash
npm install
npm run start          # press i / a / w for iOS simulator, Android emulator, Web
```

Optional: the AI coach backend

```bash
cd server && npm install
cp .env.example .env   # add ANTHROPIC_API_KEY (or use `ant auth login`)
npm run dev            # http://localhost:8787
# in the app root:
cp .env.example .env   # EXPO_PUBLIC_COACH_API_URL=http://localhost:8787
```

Without the server the Coach tab still works in offline mode.

## Scripts

| Command                           | What it does                                                            |
| --------------------------------- | ----------------------------------------------------------------------- |
| `npm run verify`                  | tokens check → contrast audit → lint → typecheck → tests (what CI runs) |
| `npm run tokens:build`            | regenerate `generated.ts` from `tokens.json`                            |
| `npm run a11y:contrast`           | WCAG 2.1 AA audit of every semantic color pair in both modes            |
| `npm test` / `npm run test:watch` | Jest + React Native Testing Library                                     |
| `npm run lint` / `npm run format` | ESLint (Expo flat config + Prettier)                                    |
| `npm run export:web`              | static web build to `dist/`                                             |
| `npm run server:dev`              | run the coach backend with file watching                                |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — folders, decisions, coach data flow
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — token tiers, component parity, motion, governance
- [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) — automated gates, patterns, manual audit checklist
- [docs/ANALYTICS.md](docs/ANALYTICS.md) — event taxonomy, funnels, Hotjar, privacy
- [docs/EXPERIMENTS.md](docs/EXPERIMENTS.md) — A/B process and active experiments
- [docs/FIGMA_HANDOFF.md](docs/FIGMA_HANDOFF.md) — how Figma and code stay in sync

## Project structure

```
src/app            routes (Expo Router)      src/features      vertical slices + stores
src/design-system  tokens, theme, components src/analytics     events, core, adapters
src/experiments    A/B framework             server/           Claude coach backend
scripts/           token build + a11y audit  __tests__/        unit + component tests
```

## Hosting the web app

Vercel configuration is included. See [docs/VERCEL.md](docs/VERCEL.md) for CLI deployment, Git import, direct-route support, and the optional online coach setup.

## Building for stores

EAS profiles are in `eas.json` (`development`, `preview`, `production`). `npx eas-cli build --profile preview --platform all` produces installable builds; CI triggers it on `main` when the `EAS_ENABLED` repository variable is `true` and `EXPO_TOKEN` is set.
