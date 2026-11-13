# A/B Testing & Experimentation

## How it works

- **Registry** (`src/experiments/registry.ts`): each experiment declares `variants` with traffic weights, a `primaryMetric`, and an `enabled` kill switch.
- **Assignment** (`assign.ts`): deterministic FNV-1a hash of `experimentKey::unitId` → weighted bucket. Same unit always gets the same variant; different experiments bucket independently (verified by test).
- **Exposure** (`useExperiment`): the hook returns the variant and logs `experiment_exposure` exactly once per unit per variant, the first time the surface renders. Analysis uses exposed users only.
- **Overrides** (`Profile → Experiments`): QA/design can force a variant; overrides are persisted and re-log exposure.
- **Segmentation**: all analytics events carry the current assignments map.

## Active experiments

| Key                        | Hypothesis                                                                           | Primary metric                                           | Guardrails                           |
| -------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------- | ------------------------------------ |
| `onboarding_progress_copy` | A time estimate ("About 1 min left") reduces registration drop-off vs. "Step 2 of 5" | `onboarding_completed / onboarding_step_viewed[welcome]` | time-on-step, `onboarding_abandoned` |
| `today_primary_cta`        | Contextual CTA copy ("18 active min to go") increases workout starts                 | `workout_started / screen_viewed[today]`                 | `workout_abandoned` rate             |
| `coach_suggestion_chips`   | Suggestion chips increase first-message rate                                         | `coach_message_sent / coach_opened`                      | `coach_response_failed`              |

## Process

1. **Design brief** (Figma + Miro): problem, hypothesis, variants, success metric, minimum detectable effect, sample size.
2. **PR**: add to the registry, implement variant branches behind `useExperiment`, add a test if logic is non-trivial.
3. **QA**: force each arm via the override panel; verify exposure events in the console adapter.
4. **Run** until the pre-registered sample size; do not peek-and-stop.
5. **Decide**: ship winner (set weights to 100/0, then remove the branch next release) or roll back (`enabled: false`).
6. **Document** the result in this file's history table.

## Moving to a remote config

The registry is intentionally local so the app works offline. To control weights remotely, fetch a JSON of the same shape at startup and merge it over the registry in `store.ts` (`experiments` is `satisfies Record<string, ExperimentDefinition>` so the merge is type-safe).
