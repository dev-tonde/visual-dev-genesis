# Pre-Overhaul Baseline Audit

## 1. Audit date

2026-07-23

## 2. Branch

`feat/senior-portfolio-overhaul` (tracking `origin/feat/senior-portfolio-overhaul`)

## 3. Baseline commit

`5070149756dfa070b7b3b611e2d267d8950eb957` — "refactor: clearer section naming and faster reveals"

## 4. Production URL

`https://www.iamtonde.co.za` (Vercel; alias `portfolio-webaholics.vercel.app`). Deployed assets are hash-identical to a local build of `5070149`.

## 5. Test environment

Linux aarch64 sandbox; Node v22.22.3; npm 10.9.8; Lighthouse 13.4.1 on headless Chromium (Playwright 1228, fresh profile, no extensions); cross-checked in desktop Chrome. Sandbox network is TLS-intercepted (see limitations).

## 6. Validation summary

All five repository commands pass on `5070149`: `npm ci` (5.6 s, 584 pkgs), `lint` (0 warnings), `type-check`, `test` (30/30), `build` (776 ms). Details: [validation-results.md](validation-results.md).

## 7. Lighthouse score table

| Target                      | Perf   | A11y   | BP     | SEO    |
| --------------------------- | ------ | ------ | ------ | ------ |
| Production mobile ×3        | NO_FCP | NO_FCP | NO_FCP | NO_FCP |
| Production desktop ×3       | NO_FCP | NO_FCP | NO_FCP | NO_FCP |
| Local build (no secrets) ×1 | NO_FCP | —      | —      | —      |

No score is obtainable: **production does not paint any content.** Details: [lighthouse-summary.md](lighthouse-summary.md).

## 8. Core Web Vitals table

| Metric                                  | Median (production)                |
| --------------------------------------- | ---------------------------------- |
| FCP / LCP / TBT / CLS / SI / INP / TTFB | not computable — page never paints |

## 9. Bundle summary

dist 1.2 MB; JS 771 KB raw / 230 KB gzip; CSS 11.7 KB gzip; hero JPEG 175.7 KB (largest asset); no fonts; no source maps; ~218 KB gzip estimated initial JS+CSS. Details: [bundle-baseline.md](bundle-baseline.md).

## 10. Runtime issue summary

**P0 (VERIFIED): production serves a blank page on all routes.** The deployed bundle was built without `VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY`; `supabase/client.ts` throws at module load; `#root` stays empty. Also: Permissions-Policy `bluetooth` console warning (VERIFIED). Details: [production-runtime.md](production-runtime.md).

## 11. Accessibility issue summary

NOT TESTED — no UI renders on production. Must be captured after the outage fix, before overhaul work.

## 12. Visual issue summary

Current: blank page everywhere (VERIFIED). Pre-outage context (OBSERVED 2026-07-22, to re-verify): slow hero reveal on fresh load, blank scroll regions between sections, consent banner covering hero. Details: [visual-observations.md](visual-observations.md).

## 13. Evidence file index

- [repository-state.md](repository-state.md)
- [validation-results.md](validation-results.md)
- [production-runtime.md](production-runtime.md)
- [visual-observations.md](visual-observations.md)
- [bundle-baseline.md](bundle-baseline.md)
- [lighthouse-summary.md](lighthouse-summary.md)
- `lighthouse/production-{mobile,desktop}-run-{1,2,3}.{html,json}`, `lighthouse/local-mobile-run-1.{html,json}`
- `screenshots/NOTE.md` (capture limitation)

## 14. Measurement limitations

1. Production Lighthouse runs error with NO_FCP because the site is down — scores must be re-baselined after the env fix.
2. Local runtime baseline blocked: production secrets are (correctly) not in the repo, and the app hard-throws without them.
3. PageSpeed Insights API returned HTTP 429 (anonymous quota) — no independent runner evidence.
4. Screenshot files could not be written to disk by the automation tooling; findings documented textually with inline captures.
5. Sandbox TLS interception required `--ignore-certificate-errors`; blank-page finding cross-verified in unmodified desktop Chrome.
6. Mobile-viewport window resize was unreliable in this environment; responsive captures deferred.

## 15. Baseline verdict

**`BASELINE PARTIAL`**

Repository, validation, and bundle evidence are complete and reliable. Runtime, Lighthouse, visual, and accessibility evidence could not be captured beyond the outage itself, because the deployed application does not render. The P0 environment defect is fully evidenced. Re-run steps 5–7 after production renders to complete the baseline.
