# Repository State — Baseline Audit

Audit date: 2026-07-23
Classification legend: VERIFIED / MEASURED / OBSERVED / SUSPECTED / NOT TESTED

## Git state (VERIFIED)

| Item                               | Value                                           |
| ---------------------------------- | ----------------------------------------------- |
| Branch                             | `feat/senior-portfolio-overhaul`                |
| Working tree                       | Clean before audit (`git status --short` empty) |
| Remote tracking                    | `origin/feat/senior-portfolio-overhaul`         |
| Baseline commit                    | `5070149756dfa070b7b3b611e2d267d8950eb957`      |
| Commit `5070149` in branch history | YES (it is HEAD)                                |

Latest five commits:

```
5070149 refactor: clearer section naming and faster reveals
d314ef2 fix: add proper Vercel SPA rewrites and production headers
128f657 fix(ci): apply prettier formatting and resolve high-severity audit findings
fd243b2 feat: recruiter-facing portfolio alignment overhaul
a59b0f3 updates tp games section
```

## Toolchain (VERIFIED)

| Item            | Value                                                        |
| --------------- | ------------------------------------------------------------ |
| Node.js         | v22.22.3 (audit sandbox)                                     |
| npm             | 10.9.8                                                       |
| Package manager | npm (`package-lock.json` present; no bun/pnpm/yarn lockfile) |
| Package name    | `iamtonde-portfolio@1.0.0`                                   |

## Scripts in package.json (VERIFIED)

| Script     | Command                                                        |
| ---------- | -------------------------------------------------------------- |
| dev        | `vite`                                                         |
| build      | `vite build` (production build command)                        |
| build:dev  | `vite build --mode development`                                |
| type-check | `tsc --noEmit` (note: script is `type-check`, not `typecheck`) |
| lint       | `eslint .`                                                     |
| test       | `vitest run`                                                   |
| preview    | `vite preview` (serve command for the production build)        |

## CI workflows (VERIFIED)

- `.github/workflows/ci.yml` — push (main, develop) + PR (main): npm ci, `lint --max-warnings=0`, `prettier --check .`, type-check, tests. Concurrency-cancelled per ref.
- `.github/workflows/security.yml` — present (contents not re-audited in this task).

## Vercel configuration (VERIFIED)

`vercel.json`: SPA rewrite of all routes to `/index.html`; security headers including CSP (`connect-src` allows `api.github.com`, `*.supabase.co`), HSTS with preload, X-Frame-Options DENY, COOP, Permissions-Policy (note: includes unrecognised `bluetooth` feature — see production-runtime.md).

## Application inventory (VERIFIED by inspection)

- Entry point: `index.html` → `/src/main.tsx` → `App.tsx`. Inline theme-boot script and inline critical CSS in `index.html`. Service worker `/sw.js` registered in production builds only.
- Router: `react-router-dom` v6 BrowserRouter in `App.tsx`.
- Public routes: `/`, `/privacy`, `/games`, `/auth`, `*` (NotFound). Protected: `/profile`, `/admin`, `/admin/contacts`.
- Major sections on `/` (in order): Hero, Skills (`#about`), Journey (`#journey`), Projects incl. case studies (`#projects`), Certifications (`#certifications`), Contact (`#contact`), Footer with "This Site's Stack".
- Hero: `src/components/Hero.tsx` — framer-motion staggered entrance (delayChildren 0.1, stagger 0.08 as of 5070149), particle background, gradient text h1.
- Above-the-fold assets: `src/assets/programmer-hero-bg.jpg` (172 KB source, 175.7 KB emitted) loaded eagerly as full-page background in `Index.tsx`; favicon; manifest.
- Font loading: no font `<link>` in `index.html`; system font stack in critical CSS. CSP permits Google Fonts. Actual webfont usage at runtime: NOT TESTED (production is down; see production-runtime.md).
- Image loading: hero bg `loading="eager"`; other images not audited individually.
- Animation/reveal: framer-motion + `react-intersection-observer` (`triggerOnce: true, threshold: 0, rootMargin: '0px 0px -80px 0px'` since 5070149) in Skills, Journey, Projects, Certifications, Contact, SkillsVisualization.
- Lazy loading / code splitting: route-level lazy for Privacy, NotFound, Games, Auth, AdminHub, AdminContacts, Profile; component-level lazy for Projects and Certifications with skeleton fallbacks.
- GitHub live feed: `src/lib/github.ts` → `api.github.com/users/dev-tonde/repos?sort=updated&per_page=20`, optional `VITE_GITHUB_TOKEN`, explicit failure/empty states.
- Analytics: first-party Supabase (`page_views`, `user_events` tables) with consent + DNT gating (`useAnalytics.ts`); no third-party scripts.
- Error boundaries: `ErrorBoundary.tsx` wraps the app inside `App.tsx`.
- Loading states: `LoadingSpinner`, per-section skeletons (SkillsSkeleton, JourneySkeleton, CertificationsSkeleton, ProjectSkeleton).
- Fallback states: GitHub-feed unavailable state; offline.html via service worker; NotFound page.
- Accessibility utilities: skip link in `Index.tsx`, `AccessibilityEnhancer.tsx`, eslint-plugin-jsx-a11y.
- SEO: `SEOHead.tsx` (react-helmet-async), base meta in `index.html`, `robots.txt`, `sitemap.xml`, `og-image.jpg`.
- Tests: 11 files / 30 tests under `src/test/` (components, hooks, lib, pages).
- Build output: Vite (rolldown), hashed assets to `dist/assets/`, manual-ish chunking visible (ui, animations, supabase, forms, vendor, icons chunks). Source maps: none emitted (0 `.map` files).

## Critical env dependency (VERIFIED)

`src/integrations/supabase/client.ts` throws at module load if `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` are absent — the whole app fails to render. This is directly relevant to the production defect recorded in production-runtime.md.
