# Bundle Baseline — commit `5070149`

Audit date: 2026-07-23
Source: `npm run build` output (Vite/rolldown) on a clean copy of the tree. No bundle-analysis dependency was installed; figures come from the build log plus direct measurement of `dist/`.

## Totals (MEASURED)

| Metric             | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| Total `dist/` size | 1.2 MB                                                          |
| JavaScript, raw    | 789,575 B (~771 KB) across all chunks                           |
| JavaScript, gzip   | 235,551 B (~230 KB)                                             |
| CSS, raw / gzip    | 62.84 KB / 11.68 KB (single `index-BtcT-Y66.css`)               |
| Images in bundle   | `programmer-hero-bg-BeXCudwH.jpg` 175.7 KB (only bundled image) |
| Fonts in bundle    | none (system font stack; no font files emitted)                 |
| Source maps        | none emitted                                                    |

## Chunks, largest first (MEASURED, from build log; gzip in parentheses)

| Chunk                                                                  | Raw             | Gzip          |
| ---------------------------------------------------------------------- | --------------- | ------------- |
| ui-BvUZ1F3a.js                                                         | 245.48 KB       | 76.48 KB      |
| animations-Ch5DcW9b.js                                                 | 120.67 KB       | 39.96 KB      |
| supabase-SDhbHs9r.js                                                   | 107.91 KB       | 29.11 KB      |
| forms-BFGxVyWQ.js                                                      | 86.58 KB        | 23.19 KB      |
| index-DVumqQi3.js (entry)                                              | 52.99 KB        | 17.03 KB      |
| Games-D7YNAnzT.js                                                      | 28.55 KB        | 7.64 KB       |
| Projects-CvA6jIm9.js                                                   | 25.78 KB        | 8.13 KB       |
| button-CmmNb95r.js                                                     | 22.34 KB        | 7.71 KB       |
| vendor-DJytn-Cf.js                                                     | 21.78 KB        | 8.06 KB       |
| AdminContacts-BJms4GeJ.js                                              | 14.88 KB        | 4.58 KB       |
| icons-BL7VYMfW.js                                                      | 14.16 KB        | 5.41 KB       |
| Privacy-DZ6DJ9Dd.js                                                    | 10.27 KB        | 2.96 KB       |
| tabs / Certifications / NotFound / Profile / Auth / AdminHub / runtime | 0.8–7.4 KB each | ≤ 2.9 KB each |

## Code-splitting boundaries (VERIFIED)

Route-level: Privacy, NotFound, Games, Auth, AdminHub, AdminContacts, Profile. Component-level: Projects, Certifications. Everything else ships in the initial graph.

## Above-the-fold / initial-load assets (SUSPECTED composition — request-level waterfall NOT TESTED while production is down)

Initial route `/` is expected to pull: entry (17 KB gz) + ui (76.5 KB gz) + animations (40 KB gz) + supabase (29.1 KB gz) + forms (23.2 KB gz, Contact renders eagerly) + vendor + button + icons (~21 KB gz) + CSS (11.7 KB gz) ≈ **~218 KB gzip JS+CSS**, plus the 175.7 KB hero background JPEG which is rendered eagerly as a full-page fixed background.

## Observations (not defects unless later confirmed)

- SUSPECTED: `supabase` (29 KB gz) and `forms` (23 KB gz) load on first paint though they are only needed for analytics/auth/contact; deferral candidates.
- SUSPECTED: `animations` chunk (framer-motion, 40 KB gz) gates content reveal on a content site.
- MEASURED: hero JPEG is the single largest asset (175.7 KB) and is not responsive/AVIF/WebP.
- MEASURED: no duplicated large dependencies visible at chunk level; chunking strategy looks intentional (named ui/animations/supabase/forms groups).
