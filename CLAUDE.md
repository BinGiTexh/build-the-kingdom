# CLAUDE.md

This file provides context for Claude Code when working on this repository.

## What This Project Is

A white-label job platform template designed to be forked. Each fork becomes a standalone job site by changing environment variables — no code changes needed for basic rebranding.

The business model is "arb" (arbitrage): ingest job feeds from aggregators (Appcast-style XML/JSON), display them on the site, and earn revenue when users click through to apply on the original employer's site.

## How to Run

```bash
cp .env.example .env   # fill in DB_PASSWORD, JWT_SECRET at minimum
docker compose up -d --build
```

Migrations run automatically on API startup. Frontend at :3000, API at :5000.

## Project Structure

- `docker-compose.yml` — orchestrates db, api, frontend, redis, pgadmin
- `.env.example` — all config with descriptions; `.env` is gitignored
- `backend/` — Express API (Node 22 Alpine in Docker)
  - `server.js` — app entry, mounts routes, helmet, rate limiting
  - `middleware/auth.js` — `authenticateToken`, `optionalAuth`, `requireRole`
  - `routes/` — 11 route files (auth, jobs, applications, profiles, companies, notifications, payments, feeds, config, redirect, users)
  - `services/` — feedIngestionService (streaming SAX), paymentService, webhookService, jobViewService
  - `prisma/schema.prisma` — 14 models, 9 enums; migrations auto-deploy
  - `lib/prisma.js` — singleton Prisma client
- `packages/frontend/` — React 18 + Vite + Tailwind
  - `src/context/SiteConfigContext.jsx` — fetches `/api/config`, sets CSS vars for colors
  - `src/context/AuthContext.jsx` — JWT auth state
  - `src/context/ThemeContext.jsx` — dark mode
  - `src/pages/` — HomePage, JobSearchPage, JobDetailsPage, dashboards, auth pages
  - `src/services/api.js` — axios instance with auth interceptor

## Key Architectural Decisions

- **White-label via env vars**: `SITE_NAME`, `SITE_TAGLINE`, `PRIMARY_COLOR`, `SECONDARY_COLOR` flow from `.env` → `/api/config` → `SiteConfigContext` → CSS custom properties (`--color-primary-*`). All gradients, buttons, and brand text use these variables.
- **No Jamaica-specific code**: This was ported from JamDung Jobs but all parish validation, JMD currency hardcoding, and HEART partnership logic were intentionally excluded. Keep it generic.
- **Stripe is optional**: Controlled by `STRIPE_ENABLED=true/false`. The payment service checks this before any Stripe call. Don't assume Stripe is available.
- **Feed ingestion scales to 1M+**: Uses streaming SAX parser (not xml2js), batch upserts of 5,000, pause/resume on the HTTP stream during DB writes. Never load entire XML into memory.
- **Prisma migrate deploy on startup**: The docker-compose API command runs `npx prisma migrate deploy` before `npm run dev`. New migrations are auto-applied.
- **Anonymous Docker volumes for node_modules**: The compose file uses `/app/node_modules` as an anonymous volume. After adding new npm dependencies, rebuild with `docker compose up -d --build -V` to refresh them.

## Database

PostgreSQL 15. Key models:
- **User** — roles: ADMIN, EMPLOYER, JOBSEEKER; has optional companyId
- **Job** — has `externalJobId` (unique, for feed dedup), `feedSource`, indexes on status/location/type/createdAt/feedSource/companyId
- **Application** — status enum: PENDING → REVIEWED → SHORTLISTED → ACCEPTED/REJECTED
- **Payment/Subscription** — Stripe IDs stored; webhooks use idempotent `WebhookEvent` table

## Conventions

- Route files: `backend/routes/<name>.routes.js`
- Services: `backend/services/<name>Service.js` (class-based, exported as singleton)
- Auth guards: `authenticateToken` (required), `optionalAuth` (sets req.user if token present), `requireRole(['EMPLOYER'])` (after authenticateToken)
- Frontend pages: `packages/frontend/src/pages/<Name>.jsx`
- API responses: `{ data }` on success, `{ error: "message" }` on failure
- Jobs use `companyId` FK to Company (nullable for feed-imported jobs)

## Common Tasks

### Add a new API endpoint
1. Create or edit `backend/routes/<name>.routes.js`
2. Register in `backend/server.js` with `app.use('/api/<path>', require('./routes/<name>.routes'))`
3. Add auth middleware as needed: `authenticateToken`, `requireRole(['ROLE'])`

### Add a new database field
1. Edit `backend/prisma/schema.prisma`
2. Run `docker compose run --rm api npx prisma migrate dev --name describe_change`
3. The migration file is committed; it auto-applies on next startup

### Add a new npm dependency
1. Edit `backend/package.json`
2. Run `docker compose up -d --build -V` (the `-V` recreates anonymous volumes)

### Test the fork workflow
1. Clone to a temp directory
2. Create `.env` with custom branding
3. `docker compose up -d --build`
4. Verify `/api/config` returns custom values and frontend displays them

## What Not to Do

- Don't hardcode site names, colors, or copy — use `config.siteName`, CSS variables, etc.
- Don't assume Stripe is enabled — always check `STRIPE_ENABLED` or `paymentService.assertEnabled()`
- Don't load entire feed files into memory — use the streaming SAX approach
- Don't add Jamaica-specific logic (parish validation, JMD, HEART) — this is the generic base
- Don't commit `.env` files or secrets — `.gitignore` covers `.env*`, `*.pem`, `*.key`, `credentials.json`
- Don't use `git add -A` — stage specific files to avoid accidentally committing secrets
