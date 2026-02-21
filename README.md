# Growth Forum Opportunities Platform

A production-grade web platform for curating and managing grants, scholarships, fellowships, jobs, and programmes.

## What is included

- Public opportunity directory with filtering and search
- SEO-friendly pages and Open Graph metadata
- Admin panel with protected CRUD operations
- AI URL import for opportunity extraction
- Mobile-ready responsive UI across key pages
- Supabase-backed reminder subscriptions
- Mailgun-powered reminder and confirmation emails
- Vercel cron endpoint for expiring-soon reminders

## Tech stack

- Next.js 13 (App Router) + TypeScript
- Supabase (PostgreSQL + Auth policies)
- Tailwind CSS + shadcn/ui
- Mailgun API (email delivery)
- OpenAI API (optional AI import route)

## Local setup

### 1. Install

```bash
npm install
```

### 2. Configure environment

Create `.env.local` using `.env.example`:

```bash
cp .env.example .env.local
```

Required variables:

```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

MAILGUN_API_KEY=your_mailgun_api_key
MAILGUN_DOMAIN=mg.yourdomain.com
MAILGUN_FROM_NAME=Growth Forum
MAILGUN_FROM_EMAIL=reminders@mg.yourdomain.com

CRON_SECRET=long_random_secret
REMINDER_SIGNING_SECRET=long_random_secret
REMINDER_DAYS_AHEAD=3
```

`OPENAI_API_KEY` is only required if you use the AI import endpoint.

### 3. Apply Supabase SQL

Run SQL from:

- `supabase/migrations/20260221_saved_subscriptions_mailgun.sql`

This ensures reminder columns and indexes exist for Mailgun workflow.

### 4. Run

```bash
npm run dev
```

Open `http://localhost:3000`.

## Mailgun reminder flow

- Client calls `POST /api/reminders/subscribe`
- Subscription is upserted in `saved_subscriptions`
- Confirmation email is sent via Mailgun
- Vercel cron calls `GET /api/reminders/dispatch` daily
- Expiring opportunities are emailed to active subscribers
- One-click unsubscribe route: `GET /api/reminders/unsubscribe?token=...`

## Vercel deployment

1. Import this repo in Vercel
2. Add all env vars from `.env.example`
3. Keep `vercel.json` committed (daily cron at 09:00 UTC)
4. Redeploy

### Important

- For Supabase server operations, use `SUPABASE_SERVICE_ROLE_KEY` in Vercel env vars
- Keep `CRON_SECRET` set so cron endpoint cannot be called publicly
- Set `NEXT_PUBLIC_APP_URL` to your Vercel URL first, then your real domain later

## Routes

### Public

- `/` Home
- `/opportunities` Full listing with filters
- `/opportunity/[slug]` Opportunity details
- `/saved` Client-side saved list

### Admin

- `/admin/login`
- `/admin`
- `/admin/opportunities`
- `/admin/add`
- `/admin/edit/[id]`
- `/admin/import-url`

### Reminder APIs

- `POST /api/reminders/subscribe`
- `GET /api/reminders/dispatch` (cron)
- `GET /api/reminders/unsubscribe`

## Deployment note about Supabase connections

This app uses Supabase HTTP APIs, not direct Postgres connections, for most runtime operations. That means Vercel deployment is straightforward and avoids the IPv4 direct-connection issue shown in Supabase DB connection dialogs.
