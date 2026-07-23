# Deployment Overview — Tonderai Matanga Portfolio

**Last updated:** 2026-07-23 (supersedes the 2025-11-10 pre-deployment audit, which described the retired Supabase architecture; the historical pre-removal evidence lives in `docs/audits/baseline/`)

## What is deployed

- **Hosting:** Vercel — static Vite build (`dist/`) plus one serverless function (`api/contact.ts`)
- **Production URL:** https://www.iamtonde.co.za
- **Application type:** client-rendered React SPA; `vercel.json` rewrites all non-matching paths to `/index.html` (filesystem and `/api/*` functions match first)
- **Backend:** none beyond the contact function. No database, no authentication, no admin surface, no custom analytics. Contact submissions are not stored by the application — they are forwarded as email via Resend.

## Environment variables (Vercel project settings)

Names only — values are never committed. All are server-side; none use the `VITE_` prefix, and none appear in the browser bundle.

| Variable                   | Scope                | Required           | Purpose                      |
| -------------------------- | -------------------- | ------------------ | ---------------------------- |
| `RESEND_API_KEY`           | Production + Preview | For email delivery | Resend API key               |
| `CONTACT_EMAIL`            | Production + Preview | For email delivery | Destination inbox            |
| `CONTACT_FROM`             | Production + Preview | Optional           | Verified sender address      |
| `UPSTASH_REDIS_REST_URL`   | Production + Preview | Optional           | Cross-instance rate limiting |
| `UPSTASH_REDIS_REST_TOKEN` | Production + Preview | Optional           | Cross-instance rate limiting |
| `CONTACT_ALLOWED_ORIGINS`  | Production           | Optional           | Extra allowed origins        |

Client-side (optional, public by design): `VITE_GITHUB_USERNAME`, `VITE_GITHUB_TOKEN` (build-time, raises GitHub API rate limits for the repo feed).

**The site renders fully with zero environment variables configured.** Missing contact variables degrade only the form (visitors are told to email directly); this is deliberate after the July 2026 outage caused by a hard build-time env dependency.

## Anti-abuse posture (contact endpoint)

Documented in detail in `ARCHITECTURE.md`: per-source rate limits (10 attempts/60 min, 3 accepted/15 min, HTTP 429 + `Retry-After`), honeypot + minimum-completion-time bot checks, POST/JSON-only with a 10 KB cap, origin allow-list including `*.vercel.app` Previews, 8 s Resend timeout, fail-open limiter, hashed source identifiers, no PII logging.

**Upstash note (optional service):** enabling cross-instance rate limiting requires an Upstash Redis database (free tier: 500k commands/month — orders of magnitude beyond contact-form traffic). Configure the two `UPSTASH_*` variables in both Preview and Production scopes. If the service is unreachable, the endpoint fails open and per-instance limiting still applies.

## Deployment checklist

1. CI green on the branch (lint, Prettier, app + API type-checks, tests, build).
2. Vercel Preview deploy: run the Preview test plan in `docs/audits/reports/00-supabase-removal-pre-push-review.md` §11 (function reachability, 400/405/429 behaviour, graceful no-config failure, removed routes → NotFound, CSP console check).
3. Confirm env vars in the target scope (see table above).
4. Promote/merge to `main` → production deploy.
5. Post-deploy: submit one real contact message end-to-end; re-run Lighthouse to complete the baseline (`docs/audits/baseline/`).

## Known limitations

- No server-side rendering: nothing renders without JavaScript (prerendering the index route is planned overhaul work).
- Rate limiting is per-instance best-effort until Upstash variables are configured.
- The Permissions-Policy header includes a `bluetooth` token Chrome does not recognise (console warning; cosmetic).
