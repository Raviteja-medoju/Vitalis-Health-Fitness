# Analytics & Research Instrumentation

## Architecture

```
useAnalytics().track(name, props)
        │
        ▼
   Analytics core  ── enriches: session_id, anonymous_id, platform, app_version, experiments{}
        │            ── consent buffer (events held until consent granted)
        ├── ConsoleAdapter      (dev)
        ├── HttpBatchAdapter    (your collector / PostHog / Segment proxy; batches of 20 or 5 s)
        └── HotjarAdapter       (web only: heatmaps, recordings, funnels; events + stateChange on route)
```

- Event names and payloads are **typed** in `src/analytics/events.ts` (object_action naming). A new event is a PR to that file so design, PM and data review it together.
- `ScreenTracker` emits `screen_viewed` on every Expo Router path change; Hotjar receives `stateChange` so recordings segment by screen in a single-page web build.
- Every event carries the user's current experiment assignments, so any metric can be split by variant without joins.

## Funnels

### Onboarding (registration drop-off)

`onboarding_step_viewed[welcome] → goals → about_you → schedule → ready → onboarding_completed`

Each step emits `step_viewed`, `step_completed` (with `duration_ms`) or `step_skipped`. Drop-off at step _n_ = viewed(n) − (completed(n) + skipped(n)). Time-on-step highlights friction (e.g. the About-you form) and feeds usability-test scripts.

### Workout

`workout_viewed → workout_started → workout_completed | workout_abandoned (completion_pct)`

### Coach

`coach_opened → coach_message_sent → coach_response_received (latency_ms, fallback) → coach_action_tapped`

### Retention proxies

`goal_reached`, `water_logged`, `meal_logged`, `app_opened` (DAU), `workout_completed` streaks.

## Hotjar setup (web)

1. Set `EXPO_PUBLIC_HOTJAR_SITE_ID` in `.env`.
2. Hotjar loads only after `HotjarAdapter.init()`; wire that to your consent banner (`analytics.setConsent(true)`).
3. In Hotjar, create Funnels from the Events above (`onboarding_step_viewed`, `onboarding_completed`) and filter Recordings by `screen_viewed` paths.
4. Pair heatmaps with Miro storyboards: export the heatmap PNG for each step and pin it next to the corresponding storyboard frame to drive redesign decisions.

## Privacy

- Anonymous id only; no PII in event props (names, emails and body metrics never leave the device).
- Consent gate buffers up to 200 events in memory and discards on refusal.
- `HttpBatchAdapter` flushes on background; network failures re-queue (bounded).
