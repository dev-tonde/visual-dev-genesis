# Pre-Push Review — Supabase Removal (`c3615dc`)

Review date: 2026-07-23
Base: `5070149756dfa070b7b3b611e2d267d8950eb957` · Head: `c3615dc`
Reviewer note: static review + full validation on a `git archive` of the exact commit. No files were modified; this report is the only file created.

## 1. Executive verdict

**`SAFE TO PUSH FOR PREVIEW`** — with the material caveat that the commit is **already on the remote**: `origin/feat/senior-portfolio-overhaul` points at `c3615dc` (it was pushed before this review ran). All repository validation passes on the exact commit, Supabase is fully removed from runtime code, no secrets are committed, and the built bundle is clean. Preview verification of the new `/api/contact` function is required before merge. Not safe to merge to production until the Preview test plan in §11 passes and the stale-documentation findings are addressed.

## 2. Diff summary

| Item                  | Value                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Current branch        | `feat/senior-portfolio-overhaul`                                                                                                                 |
| Working tree          | Clean (`git status --short` empty before this report)                                                                                            |
| `c3615dc` is HEAD     | Yes                                                                                                                                              |
| Exists on remote      | **Yes** — `origin/feat/senior-portfolio-overhaul` = `c3615dc`                                                                                    |
| Files changed         | 61 (24 added, 25 deleted, 12 modified, 0 renamed)                                                                                                |
| Additions / deletions | +60,397 / −5,865 (bulk of additions = 14 generated Lighthouse evidence files)                                                                    |
| `git diff --check`    | Trailing-whitespace warnings **only** inside generated `docs/audits/baseline/lighthouse/*.html` evidence files; no source-file whitespace errors |

## 3. Required and unrelated changes

| File(s)                                                                                                   | Type | Purpose                                                          | Required for removal         | Runtime risk                                                              | Rollback impact    | Belongs here                                                |
| --------------------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------- | ------------------ | ----------------------------------------------------------- |
| `src/integrations/supabase/*` (2 D)                                                                       | D    | Delete client/types                                              | Yes                          | Low (nothing imports them)                                                | Revert restores    | Yes                                                         |
| `src/components/{AuthProvider,ProtectedRoute,UserMenu,Analytics,ConsentManager}.tsx` (5 D)                | D    | Remove auth/analytics/consent                                    | Yes                          | Low                                                                       | Revert restores    | Yes                                                         |
| `src/pages/{Auth,Profile,AdminHub,AdminContacts}.tsx` (4 D)                                               | D    | Remove private pages                                             | Yes                          | Low — routes fall through to NotFound                                     | Revert restores    | Yes                                                         |
| `src/hooks/useAnalytics.ts` (D)                                                                           | D    | Remove analytics                                                 | Yes                          | Low                                                                       | Revert restores    | Yes                                                         |
| `supabase/**` (12 D)                                                                                      | D    | Remove migrations/edge function/config                           | Yes                          | None (never shipped to client)                                            | Revert restores    | Yes                                                         |
| `src/App.tsx` (M)                                                                                         | M    | Drop providers + routes                                          | Yes                          | Medium (core routing) — covered by tests                                  | Single-file revert | Yes                                                         |
| `src/components/ContactForm.tsx` (M)                                                                      | M    | Transport → `fetch('/api/contact')`                              | Yes                          | Medium — covered by 3 rewritten tests                                     | Single-file revert | Yes                                                         |
| `api/contact.ts` (A)                                                                                      | A    | New serverless email endpoint                                    | Yes                          | Medium — not unit-tested, not tsc-covered (see §4, §5)                    | Delete file        | Yes                                                         |
| `src/test/components/ContactForm.test.tsx` (M), `ConsentManager.test.tsx` (D)                             | M/D  | Test alignment                                                   | Yes                          | Low                                                                       | Revert             | Yes                                                         |
| `src/pages/Privacy.tsx`, `src/components/Footer.tsx`, `src/config/projectCaseStudies.ts`, `README.md` (M) | M    | Truthful copy/docs                                               | Yes (accuracy)               | Low                                                                       | Revert             | Yes                                                         |
| `vercel.json` (M)                                                                                         | M    | Drop `*.supabase.co` from CSP                                    | Yes                          | Low–Medium (CSP change; `connect-src 'self'` still allows `/api/contact`) | Revert             | Yes                                                         |
| `vite.config.ts`, `package.json`, `package-lock.json` (M)                                                 | M    | Remove dep + manualChunks entry                                  | Yes                          | Low — build verified                                                      | Revert             | Yes                                                         |
| `.env.example` (M)                                                                                        | M    | New env names                                                    | Yes                          | None                                                                      | Revert             | Yes                                                         |
| `.prettierignore` (A)                                                                                     | A    | Keep CI's `prettier --check .` green with evidence files present | Indirectly (unblocks CI)     | None                                                                      | Delete             | Borderline — tooling change riding along                    |
| `docs/audits/baseline/**` (16 A)                                                                          | A    | Pre-overhaul evidence                                            | **No** — separate workstream | None                                                                      | Delete directory   | Borderline — evidence bundled with implementation (see §12) |

Unexpected changes: none. Every file traces to either the removal or the baseline-evidence workstream.

## 4. Contact endpoint security review (`api/contact.ts` + `ContactForm.tsx`)

Verified sound:

- Methods: non-POST → 405 with safe JSON. Content-type: relies on Vercel's body parsing; non-JSON bodies fail validation → 400.
- Schema: server-side re-validation (name 2–50, message 10–1000, email ≤254 + regex); client mirrors via zod + sanitizers.
- Header/CRLF injection: email regex rejects all whitespace (so no CR/LF in `reply_to`); name is whitespace-collapsed before use in `subject`; delivery via Resend's JSON API (no raw SMTP headers). No injection path found.
- HTML escaping: all user fields escaped (`escapeHtml`) before HTML body interpolation.
- Open relay: recipient (`CONTACT_EMAIL`) and sender (`CONTACT_FROM`) are fixed server-side; no confirmation email is sent to the submitter — cannot be used to spam third parties.
- Missing env: returns 500 with "email me directly" message; site unaffected. Error messages are generic; no stack traces or config values leak. Nothing is logged server-side (no PII retention; message exists only in the delivered email).
- Secrets: `RESEND_API_KEY` read from `process.env` server-side only.

Gaps (severity / evidence):

| #   | Gap                                                                                                                                                                   | Severity                | Evidence                                                                                                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
| G1  | No rate limiting — unlimited POSTs will happily relay spam into your inbox and burn Resend quota                                                                      | **Medium**              | `api/contact.ts` has no counter/limiter; client handles a `RATE_LIMIT_EXCEEDED` code the server can never send |
| G2  | No bot control (no honeypot field, no turnstile/captcha)                                                                                                              | **Medium**              | Form fields in `ContactForm.tsx` are exactly name/email/message                                                |
| G3  | No explicit request-size cap before parsing (platform default limits apply)                                                                                           | Low                     | No length check on raw body; Vercel caps request bodies (~4.5 MB)                                              |
| G4  | No timeout/AbortController on the Resend fetch; relies on function max duration                                                                                       | Low                     | `fetch('https://api.resend.com/emails', …)` with no signal                                                     |
| G5  | HTML-only email body; no `text` alternative part                                                                                                                      | Low                     | Resend payload has `html` only                                                                                 |
| G6  | Duplicate/replay submissions accepted (no idempotency)                                                                                                                | Low                     | No token/dedupe; impact limited to inbox noise                                                                 |
| G7  | No CORS/origin validation — cross-origin POSTs land server-side (browser can't read the response, but the email still sends); CSRF classic risk n/a (no cookies/auth) | Low (subsumed by G1/G2) | No origin check in handler                                                                                     |
| G8  | Endpoint has no unit tests and is outside `tsc` coverage                                                                                                              | Medium (quality)        | `tsconfig.app.json` includes `src` only; no test file for `api/`                                               |

None of G1–G8 blocks a Preview push; G1+G2 should be fixed before the form is promoted to production.

## 5. Vercel deployment compatibility

- `vercel.json`: SPA rewrite `/(.*) → /index.html`. Vercel matches filesystem and functions **before** applying rewrites, so `/api/contact` should resolve to the function, not the SPA shell. This is documented platform behaviour but **REQUIRES PREVIEW VERIFICATION** (a curl POST against the preview URL).
- Function form: default-exported `(req, res)` handler in `api/contact.ts` matches the Vercel Node runtime; zero imports; `fetch` is available on Node 18+ runtimes. Self-contained interfaces avoid needing `@vercel/node` types.
- TypeScript: `api/` is compiled by Vercel independently; it is NOT covered by `npm run type-check` (tsconfig includes `src` only) — acceptable, but noted (G8).
- Build output: verified clean (§10). `api/contact.ts` is not bundled into `dist/` (correct — it deploys as a function).
- CSP: `connect-src 'self'` permits the same-origin `/api/contact` call. Dropping `*.supabase.co` is correct.
- Env access: `process.env.*` server-side only; no `VITE_`-prefixed server secrets.

## 6. UX and accessibility review (static)

- Normal flow: zod-validated inputs → POST → success toast → form reset. Loading state disables the submit button (`disabled={isSubmitting || !!retryTimeout}`) with a dynamic `aria-label`.
- Error mapping: 400 → "Invalid input" with first detail; 405/500/502 → payload message or generic fallback; network throw/offline → generic "try again or contact me directly" toast; missing Resend config → server 500 whose message names the direct-email fallback. 429 handling exists client-side but is currently unreachable (server never rate-limits — G1).
- Repeated submission: button disabled during flight; nothing prevents a second submit after completion (G6).
- Screen readers: toasts use Radix Toast primitives, which provide `role="status"`/aria-live internally — expected to announce, **verify on Preview**. Focus is not explicitly moved on success/failure (focus stays on the submit button, which is acceptable but should be confirmed).
- Keyboard: native form + Radix controls; no custom key traps found.
- Direct-email fallback: visible mailto link in `ContactInfo` next to the form. **Without JavaScript nothing renders at all** (SPA) — the fallback is not available no-JS. Pre-existing architectural limitation, unchanged by this commit.

## 7. Route-removal review

- `/auth`, `/profile`, `/admin`, `/admin/contacts` removed from `App.tsx` with their lazy imports — no dead `lazy()` references remain.
- No navigation, footer, or command-palette links pointed at these routes (verified by search); sitemap.xml never listed them; no redirects exist for them; no test expectations reference them.
- Old bookmarks now fall through the catch-all `*` route to the NotFound page — a meaningful state, not a blank page.
- Stale leftovers: `public/robots.txt` still contains `Disallow: /admin` (harmless; cosmetic cleanup) — stale reference.

## 8. Privacy and content review

Accurate after this commit: no analytics (all tracking code deleted), no tracking cookies (only theme in localStorage — stated on Privacy page), no message storage (email-only delivery — stated), Resend + Vercel + GitHub API claims (match implementation), no authentication/administration claims anywhere in site copy, contact delivery description matches `api/contact.ts`.

Remaining inaccurate/stale claims (all in repo docs, not site copy):

| Reference                                                                                                               | Classification                                                                    |
| ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `ARCHITECTURE.md` — describes Supabase client, Supabase Auth flows, Supabase in the stack                               | **Stale reference** — fix before merge                                            |
| `DEPLOYMENT_AUDIT.md` — "Backend: Supabase (PostgreSQL, Auth, Edge Functions, Storage)", RLS/admin claims               | **Stale reference** — fix before merge                                            |
| `.github/workflows/ci.yml` — injects `secrets.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` into two build steps | **Stale reference** — harmless (unused env) but misleading; remove in a follow-up |
| `docs/audits/baseline/**` mentions of Supabase                                                                          | Intentional historical evidence — keep                                            |
| `api/contact.ts` header comment ("Replaces the former Supabase edge function")                                          | Required documentation — keep                                                     |
| `public/robots.txt` `Disallow: /admin`                                                                                  | Stale reference — cosmetic                                                        |

Active runtime dependencies on Supabase: **none** (verified by source search and built-output scan).

## 9. Secret and configuration review

- No secret values committed; no `.env`/`.env.local` added (diff file list verified).
- `.env.example` contains names + obvious placeholders only.
- `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM`: server-only, read via `process.env`, no `VITE_` prefix, absent from the built bundle (scan below).
- Public fallback email exposure (`PROFILE.email` in site copy) is intentional and pre-existing.

## 10. Validation results (run on `git archive c3615dc`, Node v22.22.3 / npm 10.9.8)

| Command                            | Result                                                          | Duration | Notes                                                                                                       |
| ---------------------------------- | --------------------------------------------------------------- | -------- | ----------------------------------------------------------------------------------------------------------- |
| `npm ci`                           | PASS — 571 packages                                             | 8.8 s    | @supabase/\* gone from tree                                                                                 |
| `npm run format:check`             | **script does not exist**                                       | —        | CI runs `npx prettier --check .`; that was run instead: PASS ("All matched files use Prettier code style!") |
| `npm run lint`                     | PASS, 0 warnings                                                | ~3 s     |                                                                                                             |
| `npm run type-check`               | PASS                                                            | 0.2 s    | `api/` not covered (G8)                                                                                     |
| `npm test`                         | PASS — 10 files, 28/28                                          | 2.8 s    | ConsentManager suite removed with feature                                                                   |
| `npm run build`                    | PASS — 955 ms                                                   | 1.2 s    | supabase chunk gone; entry/ui chunks re-balanced                                                            |
| `git diff --check 5070149 c3615dc` | Whitespace warnings only in generated Lighthouse HTML evidence  | —        | No source-file issues                                                                                       |
| `git status --short`               | Clean before review; after review: only this report (untracked) | —        |                                                                                                             |

Built-output inspection: `grep -ri supabase dist/` → no matches. `grep -r "RESEND_API_KEY\|CONTACT_EMAIL\|SERVICE_ROLE" dist/` → no matches.

## 11. Preview deployment test plan

1. Deploy the branch to a Vercel Preview (env vars `RESEND_API_KEY`, `CONTACT_EMAIL`, `CONTACT_FROM` set on Preview scope).
2. `curl -X POST <preview>/api/contact -H 'Content-Type: application/json' -d '{"name":"Test User","email":"test@example.com","message":"This is a preview verification message."}'` → expect 200 success payload and email arrival. Confirms the SPA rewrite does not shadow the function.
3. Repeat with invalid payload → 400 with details; with GET → 405.
4. Temporarily unset `RESEND_API_KEY` on a second preview → expect 500 graceful payload, site still renders.
5. Browser: submit the form end-to-end; confirm toast announcement with a screen reader (VoiceOver/NVDA); confirm button disabled state; confirm reset.
6. Visit `/admin`, `/auth`, `/profile` → NotFound page renders.
7. Check console for CSP violations (connect-src) and the Permissions-Policy `bluetooth` warning.
8. Run Lighthouse (mobile + desktop ×3) against the Preview — this completes the blocked baseline.

## 12. Recommended commit structure

Ideal split (if it were not already pushed):

1. **docs: add pre-overhaul baseline audit evidence** — `docs/audits/baseline/**`, `.prettierignore`. Purpose: evidence only; zero runtime. Rollback: delete directory. Validation: prettier.
2. **feat!: remove Supabase (auth, admin, analytics, consent)** — deletions + `App.tsx` + copy/docs/CSP/dep changes. Rollback: single revert restores Supabase. Validation: full suite.
3. **feat: contact via Vercel function + Resend** — `api/contact.ts`, `ContactForm.tsx`, its test, `.env.example`. Rollback: revert restores nothing broken (form falls back to failure state).

Worth the rewrite? **No.** The commit is already on the remote; rewriting published history on a solo feature branch buys tidier archaeology at the cost of force-push risk and invalidating the remote ref. Recommendation: keep `c3615dc` as-is and let the PR description carry the three-part structure. If a split is still desired, do it with `git revert`-safe follow-ups, not a rebase.

## 13. Blocking findings

None for a Preview push. (For production merge: G1 — no rate limiting — and G2 — no bot control — should be treated as pre-merge fixes for a public unauthenticated email endpoint, and the stale `ARCHITECTURE.md` / `DEPLOYMENT_AUDIT.md` should be corrected so the repo doesn't contradict itself.)

## 14. Non-blocking findings

G3–G8 (§4), stale `ci.yml` Supabase secrets, `robots.txt` `/admin` line, unreachable client 429 retry path, no-JS fallback limitation (pre-existing), toast announcement and focus behaviour to verify on Preview, whitespace warnings confined to generated evidence HTML, `format:check` script absent (CI uses `npx prettier --check .` directly).

## 15. Final recommendation

**`SAFE TO PUSH FOR PREVIEW`** — already pushed; proceed to the Preview test plan (§11). Do **not** merge to production until: (a) §11 steps 1–6 pass on Preview, (b) G1 and G2 are addressed or explicitly accepted, and (c) ARCHITECTURE.md and DEPLOYMENT_AUDIT.md are updated to stop claiming a Supabase backend.
