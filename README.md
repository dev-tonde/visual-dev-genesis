# Tonderai Matanga Portfolio

Portfolio site built with React, TypeScript, Vite, Tailwind, Supabase, and the GitHub API.

## Requirements

- Node.js 18+
- npm 10+
- A Supabase project for auth, contact submissions, and admin data

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

3. Create `.env.local` in the project root.

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_GITHUB_USERNAME=dev-tonde
VITE_GITHUB_TOKEN=
```

Notes:
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` are required. The app throws at startup if either is missing.
- `VITE_GITHUB_TOKEN` is optional, but recommended. Without it, the projects section is more likely to hit GitHub rate limits.
- `VITE_GITHUB_USERNAME` defaults to `dev-tonde` in code. Set it explicitly if you are adapting this repo for another profile.

4. Apply the Supabase migrations in `supabase/migrations` to your Supabase project, and deploy the `supabase/functions/send-contact-email` function.

Required edge-function secrets:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
RESEND_API_KEY=your_resend_api_key
CORS_ORIGIN=http://localhost:5173
```

Notes:
- Contact submissions depend on the `send-contact-email` edge function being deployed and reachable from the frontend.
- If `RESEND_API_KEY` is missing, the submission can still be stored, but email delivery is skipped.

5. Start the development server.

```bash
npm run dev
```

The app runs at `http://localhost:5173`.

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

These tests do not require live Supabase or GitHub access.

## Troubleshooting

### The app fails immediately on startup

Check `.env.local`. Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` will break client initialization in `src/integrations/supabase/client.ts`.

### The projects section shows an unavailable state

The GitHub integration is intentionally honest now. Common causes:

- `VITE_GITHUB_USERNAME` is wrong
- GitHub is rate-limiting unauthenticated requests
- the network request failed

Set `VITE_GITHUB_TOKEN` locally if you need higher GitHub API limits.

### The contact form does not deliver email

Check the deployed `send-contact-email` function and its secrets. The frontend can still be linted, tested, and built locally without email delivery, but end-to-end contact submission requires:

- a reachable Supabase project
- the contact migrations applied
- the edge function deployed
- the required secrets configured

### I want a clean install

Use `npm ci` when you want a lockfile-accurate install from scratch. Use `npm install` when updating dependencies locally.
