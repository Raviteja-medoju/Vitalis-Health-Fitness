# Deploy Vitalis to Vercel

This deploys the Expo **web app**. Native iOS and Android builds continue to use EAS.

## Current deployment

- Website: https://vitalis-health-fitness.vercel.app
- Vercel project: https://vercel.com/ravi-teja6/vitalis-health-fitness
- This workspace is linked to that project through the ignored `.vercel/` directory.

To publish changes from this linked workspace, run `npx --yes vercel@latest --prod`.

## Deploy from this folder

Run in PowerShell:

```powershell
Set-Location E:\HealthFitness
npx --yes vercel@latest login
npx --yes vercel@latest
```

Choose your Vercel account/team, create a project (for example `vitalis-health-fitness`), and use `./` as the project directory. Keep the settings from `vercel.json`. The CLI returns a preview URL.

Check the preview, then publish to your production URL:

```powershell
npx --yes vercel@latest --prod
```

Later deployments use the same command. The local project link lives in `.vercel/`, which is excluded from Git and upload.

## Deploy through Git instead

Push the complete project to a Git provider, then import that repository in Vercel. Use the project root, not `server/` or `dist/`.

| Setting          | Value                |
| ---------------- | -------------------- |
| Framework preset | Other                |
| Install command  | `npm ci`             |
| Build command    | `npm run export:web` |
| Output directory | `dist`               |

The committed `vercel.json` sets these values and sends browser routes to the SPA entry point. Direct visits and refreshes at `/welcome`, `/nutrition`, `/workouts`, and `/workout/quick_core_10` therefore resolve to Expo Router.

## Environment and the coach

No environment variables are required for the current app. Leave `EXPO_PUBLIC_COACH_API_URL` unset to use the existing offline coach.

The optional Node server under `server/` is **not deployed** by this static website configuration. To enable the online coach later:

1. Deploy that server separately with its server-side credentials.
2. Set its `CORS_ORIGINS` to your deployed website's exact HTTPS origin.
3. Set `EXPO_PUBLIC_COACH_API_URL` in Vercel to the server's HTTPS base URL, without `/api/coach`.
4. Redeploy the web app; Expo embeds public environment variables at build time.

Do not use a localhost URL in a hosted build. Never put an Anthropic secret in an `EXPO_PUBLIC_*` variable. Local `.env` files and the backend directory are excluded from CLI upload by `.vercelignore`.

Optional analytics variables are listed in `.env.example`. Leave them unset unless those services are configured. Activity and meal data are currently stored per browser/device; hosting does not add cloud synchronization.

## Verify a deployment

- Open the landing page, then navigate into the app.
- Refresh `/nutrition` and a workout detail URL directly.
- Confirm the JavaScript assets load and the browser console has no errors.
- Add/remove a meal, save a workout, and switch light/dark mode.

References: [Expo's Vercel deployment guide](https://docs.expo.dev/guides/publishing-websites/#vercel), [Vercel CLI deployment](https://vercel.com/docs/cli/deploy).
