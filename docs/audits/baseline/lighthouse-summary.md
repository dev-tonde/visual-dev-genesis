# Lighthouse Summary — Baseline Audit

Audit date: 2026-07-23
Tooling: Lighthouse 13.4.1, headless Chromium (Playwright build 1228, fresh profile, no extensions, no authenticated sessions), Linux aarch64 sandbox.

## Production — `https://www.iamtonde.co.za`

Six runs executed: `production-mobile-run-{1,2,3}` and `production-desktop-run-{1,2,3}` (JSON + HTML in `lighthouse/`).

**Every run terminated with runtime error `NO_FCP` — "The page did not paint any content."**

| Run         | Perf | A11y | BP  | SEO | FCP | LCP | TBT | CLS |
| ----------- | ---- | ---- | --- | --- | --- | --- | --- | --- |
| mobile 1–3  | n/a  | n/a  | n/a | n/a | n/a | n/a | n/a | n/a |
| desktop 1–3 | n/a  | n/a  | n/a | n/a | n/a | n/a | n/a | n/a |

- Median performance score: **not computable** — no run produced a paint.
- Median LCP / TBT / CLS: **not computable**.
- This is not a tooling artefact: the same blank page reproduces in a normal desktop Chrome session, and the root cause is a verified uncaught startup error (see production-runtime.md).

## Local production build — `npm run preview`

- `local-mobile-run-1`: `NO_FCP` for the same reason (build without Supabase secrets throws at startup). Evidence retained in `lighthouse/local-mobile-run-1.{html,json}`.
- Further local runs were not executed: without production env values every run measures the crash, not the application.

## Target quality bar (for later work — NOT met/assessed here)

Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
Current condition: **no category score is obtainable while production fails to render.** The first prerequisite for any Lighthouse baseline is restoring a rendering production deployment; scores must then be captured before overhaul work begins.

## Measurement limitations

1. Sandbox network is TLS-intercepted; Chrome required `--ignore-certificate-errors`. This does not affect the NO_FCP result (reproduced in an unmodified desktop Chrome).
2. PageSpeed Insights API was attempted as an independent runner and returned HTTP 429 (anonymous quota exhausted) — no PSI evidence available today.
3. Lighthouse user agent reports x86_64 while the host is aarch64; irrelevant to the failure mode but noted for completeness.
