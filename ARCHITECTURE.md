# Portfolio Architecture

Last updated: 2026-07-23 (post-Supabase removal)

## Overview

A Vercel-hosted, client-rendered React SPA with exactly one piece of server-side code: a Vercel serverless function that forwards contact-form submissions via Resend. There is no database, no authentication, no private administration surface, and no custom analytics. Contact submissions are **not stored** in any application datastore — they exist only as delivered email.

## Tech stack

### Frontend

- React 18 + TypeScript, built with Vite
- Tailwind CSS + shadcn/ui (Radix primitives)
- framer-motion for entrance/reveal animation
- react-router-dom v6 (routes: `/`, `/games`, `/privacy`, `*` NotFound)
- react-hook-form + zod for the contact form
- GitHub REST API (public, client-side) for the live repository feed

### Server

- `api/contact.ts` — a single Vercel Node serverless function
- Resend REST API for email delivery (called server-side with an 8 s timeout)
- Optional Upstash Redis (REST, via `fetch`, no SDK) for cross-instance rate limiting

### Delivery & quality

- Vercel hosting: static SPA + `/api/*` functions; SPA rewrite in `vercel.json` (filesystem and functions match before the rewrite applies)
- Security headers in `vercel.json` (CSP, HSTS, X-Frame-Options, COOP, Permissions-Policy)
- CI (GitHub Actions): lint (zero-warning), Prettier check, app type-check, API type-check (`tsconfig.api.json`), Vitest, build; Lighthouse + accessibility job on `main`
- Tests: Vitest + Testing Library, including a direct test suite for the contact function

## Contact pipeline

```
ContactForm.tsx ──POST /api/contact──▶ api/contact.ts ──▶ Resend ──▶ inbox
   (zod validation,                     (hardening, see below)
    honeypot + timing evidence)
```

### Server environment variables (never `VITE_`-prefixed, never in the browser bundle)

| Variable                                              | Required           | Purpose                                                           |
| ----------------------------------------------------- | ------------------ | ----------------------------------------------------------------- |
| `RESEND_API_KEY`                                      | Yes (for delivery) | Resend API key                                                    |
| `CONTACT_EMAIL`                                       | Yes (for delivery) | Destination inbox                                                 |
| `CONTACT_FROM`                                        | No                 | Verified sender; defaults to Resend's onboarding sender           |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | No                 | Enables cross-instance rate limiting (Upstash free tier suffices) |
| `CONTACT_ALLOWED_ORIGINS`                             | No                 | Extra comma-separated allowed origins                             |

Client-side variables remain limited to the optional `VITE_GITHUB_USERNAME` / `VITE_GITHUB_TOKEN` for the repo feed.

### Anti-abuse controls

- **Rate limits per source** (source = SHA-256-hashed first `x-forwarded-for` hop; raw IPs are never stored or logged): **10 attempts / 60 min** and **3 accepted submissions / 15 min**. Enforced across serverless instances when Upstash is configured; otherwise best-effort per warm instance (documented limitation). Exceeding a limit returns **HTTP 429 with a `Retry-After` header**. Limiter outages fail **open** so legitimate mail is never dropped by infrastructure errors. IP identification is imperfect (shared offices, CGNAT, rotating IPv6) — an accepted trade-off for a portfolio-scale form.
- **Bot controls**: a honeypot field (`website`) hidden visually, removed from the accessibility tree (`aria-hidden`) and from keyboard order (`tabIndex="-1"`), plus a form-start timestamp with a 3-second minimum-completion check validated server-side. Rejections are generic and do not reveal which control triggered. No CAPTCHA, no fingerprinting, no tracking cookies.
- **Request hardening**: POST-only (405 + `Allow`), `application/json` required (415), 10 KB body cap (413), origin allow-list — production domains, `localhost`, and `*.vercel.app` Previews (403 otherwise; requests without an `Origin` header are allowed, since non-browser clients can forge one anyway, and remain rate-limited).
- **Delivery safety**: recipient and sender are server-controlled; the only user-influenced address is `reply_to`, validated against a whitespace-free email pattern (no CRLF injection); user content is HTML-escaped, and both `text` and `html` parts are sent; Resend calls are wrapped in an `AbortController` 8-second timeout.

### Degraded behaviour

| Condition                                  | Behaviour                                                                     |
| ------------------------------------------ | ----------------------------------------------------------------------------- |
| `RESEND_API_KEY` / `CONTACT_EMAIL` missing | Form fails with an "email me directly" message; the site itself is unaffected |
| Resend down or timing out                  | Generic 502; client offers retry + direct email fallback                      |
| Limiter (Upstash) down                     | Fail-open; per-instance limiter still applies                                 |
| JavaScript disabled                        | The SPA does not render (known limitation, tracked in the overhaul plan)      |

## Rendering & performance model

Client-rendered SPA. Route-level code splitting (Games, Privacy, NotFound) and component-level splitting (Projects, Certifications) with skeleton fallbacks; manual vendor chunking in `vite.config.ts` (ui / animations / forms / icons groups); reveal-on-scroll via IntersectionObserver with an early-trigger root margin. A service worker provides a minimal offline fallback page. Prerendering the index route is planned overhaul work, not current behaviour.

## Privacy posture

No analytics of any kind, no tracking cookies, no consent banner needed. The only browser storage is the theme preference in `localStorage`. Contact submissions are delivered as email and not persisted by the application. See `/privacy` for the visitor-facing statement.

## Historical note

Earlier revisions used Supabase (PostgreSQL, Auth, Edge Functions) for contact storage, an admin inbox, and first-party analytics. All of it was removed on the `feat/senior-portfolio-overhaul` branch (commit `c3615dc`); evidence of the pre-removal state lives in `docs/audits/baseline/`.
