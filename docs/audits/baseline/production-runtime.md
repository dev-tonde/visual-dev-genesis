# Production Runtime — Baseline Audit

Audit date: 2026-07-23

## Deployed target

| Item                     | Value                                                                                                                                                                                                               | Classification                                                |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Canonical production URL | `https://www.iamtonde.co.za`                                                                                                                                                                                        | VERIFIED (README, GitHub repo homepage field, page `<title>`) |
| Secondary alias          | `portfolio-webaholics.vercel.app` (former GitHub homepage value)                                                                                                                                                    | OBSERVED                                                      |
| Deployment target        | Vercel (vercel.json, README, deployment history on GitHub repo page)                                                                                                                                                | VERIFIED                                                      |
| Deployed commit          | Appears to be `5070149`: the deployed asset filenames `index-DVumqQi3.js` and `index-BtcT-Y66.css` are hash-identical to a local build of `5070149`. Hash identity implies content identity for Vite-hashed assets. | VERIFIED (asset-hash match)                                   |
| Deployed build env       | Built WITHOUT `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY`                                                                                                                                                 | VERIFIED (see P0 below)                                       |

## P0 defect — production renders a blank page

- Classification: VERIFIED
- Route: `/` (also reproduced on `/games`; SPA-wide by mechanism)
- Viewports: desktop 1459×812 and mobile-emulated — all affected
- Reproduction: open `https://www.iamtonde.co.za` in a fresh session → page stays a black/near-black background indefinitely; `<div id="root">` remains empty.
- Console evidence (headless Chromium, fresh profile):
  `Uncaught Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Check your .env.local file.` — source `https://www.iamtonde.co.za/assets/index-DVumqQi3.js`
- Cross-check: reproduced in a normal desktop Chrome session (black page after 8 s; all asset requests return 200).
- Affected file: `src/integrations/supabase/client.ts` (throws at module load), `dist` built without env.
- User impact: total — no visitor sees any content.
- Recruiter/hiring impact: critical — the portfolio is effectively offline while the copy claims "senior front-end developer".
- Likely technical area: Vercel project environment variables missing/not applied to the latest production build; module-level hard throw turns a config problem into a full outage (no error UI; ErrorBoundary cannot catch a module-evaluation throw).
- Confidence: high.
- Historical note (OBSERVED): the site rendered fully in this same Chrome profile earlier on 2026-07-22 (hero, sections, contact all functional), so the outage began with a recent deployment, consistent with the first deploy of `5070149` content.

## Other runtime observations

| Finding                                                                                                                               | Detail                                                                                         | Classification |
| ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | -------------- |
| Console warning                                                                                                                       | `Error with Permissions-Policy header: Unrecognized feature: 'bluetooth'` (vercel.json header) | VERIFIED       |
| Extension noise                                                                                                                       | "message channel closed" errors originate from browser extensions, not the site                | OBSERVED       |
| Asset requests                                                                                                                        | `index-DVumqQi3.js`, `index-BtcT-Y66.css` → HTTP 200                                           | VERIFIED       |
| GitHub API calls                                                                                                                      | None fired (app crashes before data fetch)                                                     | VERIFIED       |
| Favicon/manifest                                                                                                                      | Present in repo (`favicon.ico`, `manifest.json`); runtime 404 check NOT TESTED                 |                |
| Hydration errors                                                                                                                      | n/a (client-rendered SPA, no SSR)                                                              | VERIFIED       |
| Mixed content / CSP violations                                                                                                        | None observed in captured console output; full audit NOT TESTED while site is down             |                |
| Keyboard navigation, focus states, skip link, headings, landmarks, alt text, form labels, reduced motion, touch targets, layout shift | NOT TESTED — no UI renders on production; must be re-run after the outage is fixed             | NOT TESTED     |

## Local production build runtime

- `npm run build` + `npm run preview` on commit `5070149` without Supabase secrets reproduces the identical blank page and the same uncaught error (VERIFIED). This confirms the failure mechanism independent of Vercel.
- A local build WITH production env values was not possible: secrets are (correctly) not in the repository. Classification: blocker for local runtime baseline.
