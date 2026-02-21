# Systematic MVP Setup Guide

This guide covers everything needed to run Systematic locally and deploy it.

## 1. Prerequisites

- Node.js `>=20` (you currently have Node 24, which is fine)
- npm `>=10`
- A Supabase project
- An Anthropic API key (for validator calls)
- A Vercel account (for deployment)

## 2. Install dependencies

From the project root:

```bash
npm install
```

## 3. Create Supabase project and schema

1. Create a new Supabase project in the Supabase dashboard.
2. Open **SQL Editor**.
3. Copy/paste and run the migration file:
   - `supabase/migrations/20260220170000_init.sql`

This creates:
- enums (`tier_id`, `relationship_type`, `validation_status`)
- tables (`systems`, `nodes`, `edges`, `validator_daily_usage`)
- triggers/guards
- RLS policies

## 4. Get required secrets from Supabase + Anthropic

### Supabase values
In Supabase dashboard:
- **Project URL** -> `NEXT_PUBLIC_SUPABASE_URL`
- **anon public key** -> `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role key** -> `SUPABASE_SERVICE_ROLE_KEY`

### Anthropic value
From Anthropic console:
- API key -> `ANTHROPIC_API_KEY`

## 5. Configure local environment

Copy the env template:

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
ANTHROPIC_API_KEY=...
```

## 6. Run locally

```bash
npm run dev
```

Open: [http://localhost:3000](http://localhost:3000)

Expected flow:
1. Sign up / sign in
2. Create a System
3. Complete or skip onboarding
4. Build graph on canvas
5. Validate nodes
6. Export JSON

## 7. Local quality checks

Run lint:

```bash
npm run lint
```

Run unit tests:

```bash
npm run test
```

Run production build check:

```bash
npm run build
```

E2E scaffold exists, but tests are currently placeholder/skipped:

```bash
npm run test:e2e
```

## 8. Deploy to Vercel

1. Push repo to GitHub.
2. In Vercel, import the repo.
3. In project settings, add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ANTHROPIC_API_KEY`
4. Deploy.

Vercel build command is default (`next build`) and start command is default (`next start`).

## 9. Production checklist

- Supabase migration executed in production project
- Vercel env vars set for **Production** (and **Preview** if needed)
- Auth redirect URLs configured in Supabase Auth settings:
  - local: `http://localhost:3000/**`
  - prod: `https://<your-domain>/**`
- Verify RLS is enabled for all MVP tables

## 10. Troubleshooting

### "Missing environment variable"
One of the four required env vars is missing or misspelled in `.env.local` or Vercel settings.

### Auth works locally but not in deployed app
Usually Supabase Auth redirect URL config is missing your Vercel domain.

### Validation fails
Check:
- `ANTHROPIC_API_KEY` exists
- Anthropic key has quota
- user has not exceeded daily limit (20 validations/day)

### API 401 errors
You are unauthenticated in current browser session, or Supabase auth cookies are missing.

## 11. Key files

- Env template: `.env.example`
- DB migration: `supabase/migrations/20260220170000_init.sql`
- API routes: `src/app/api/*`
- Canvas UI: `src/components/canvas/system-canvas.tsx`
- Onboarding UI: `src/components/onboarding/onboarding-form.tsx`

