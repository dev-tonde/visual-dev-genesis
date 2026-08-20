# Tonderai Matanga Portfolio

Portfolio of Tonderai Matanga — senior front-end developer (React, TypeScript, Next.js, WordPress, Drupal). Live at [iamtonde.co.za](https://iamtonde.co.za).

Built with React, TypeScript, Vite, Tailwind, the GitHub API, and a single Vercel serverless function for contact email (Resend). No database, no auth, no analytics, no cookie banner.

## Requirements

- Node.js 18+
- npm 10+

The site renders fully with zero environment variables. Env vars only enhance it (GitHub rate limits) or enable the contact form's email delivery in deployment.

## Local Setup

1. Clone the repository and enter the project folder.

```bash
git clone <repo-url>
cd visual-dev-genesis
```

2. Install dependencies.

```bash
npm install
```

3. (Optional) Create `.env.local` in the project root.

```env
VITE_GITHUB_USERNAME=dev-tonde
VITE_GITHUB_TOKEN=
```

Notes:

- `VITE_GITHUB_TOKEN` is optional, but recommended. Without it, the projects section is more likely to hit GitHub rate limits.
- `VITE_GITHUB_USERNAME` defaults to `dev-tonde` in code. Set it explicitly if you are adapting this repo for another profile.

4. Start the development server.

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

## Contact form (deployment)

Contact submissions are handled by `api/contact.ts`, a Vercel serverless function that forwards messages via [Resend](https://resend.com). Configure these in the Vercel project settings (server-side only — never as `VITE_` variables):

```env
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=inbox-that-receives-submissions
CONTACT_FROM="Portfolio <contact@your-verified-domain>"
```

If they are missing, the form fails gracefully with a "contact me directly" message — the rest of the site is unaffected. Locally, `vite dev` does not run the function; use `vercel dev` if you need to test the endpoint end-to-end.

The endpoint is protected against abuse (rate limits per source, honeypot + timing bot checks, strict method/content-type/size/origin validation — see `ARCHITECTURE.md`). Optionally set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` (server-side) to make rate limiting effective across serverless instances; without them it is best-effort per instance.

## Validation Commands

Run these before shipping changes:

```bash
npm run type-check
npm run lint
npm run test
npm run build
```

## Available Scripts

```bash
npm run dev         # Start the Vite dev server
npm run build       # Build the production bundle
npm run build:dev   # Build using Vite's development mode
npm run type-check  # Run TypeScript without emitting files
npm run lint        # Run ESLint
npm run test        # Run the Vitest suite once
npm run preview     # Preview the built app locally
```

## QA Coverage

The current tests focus on user-facing risk rather than broad coverage:

- Contact form success, validation, and generic failure states
- Section navigation from `/` and from routed pages like `/games`
- Projects loading, GitHub failure, filter-empty, and verified-link states

These tests do not require live network access.

## Troubleshooting

### The projects section shows an unavailable state

The GitHub integration is intentionally honest. Common causes:

- `VITE_GITHUB_USERNAME` is wrong
- GitHub is rate-limiting unauthenticated requests
- the network request failed

Set `VITE_GITHUB_TOKEN` locally if you need higher GitHub API limits.

### The contact form does not deliver email

Check the Vercel function logs for `api/contact` and confirm `RESEND_API_KEY`, `CONTACT_EMAIL`, and `CONTACT_FROM` are set in the Vercel project. The frontend can be linted, tested, and built without these; only email delivery needs them.

### I want a clean install

Use `npm ci` when you want a lockfile-accurate install from scratch. Use `npm install` when updating dependencies locally.
