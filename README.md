# Job Platform Template

A white-label job board you can fork and rebrand by editing one `.env` file. Built with React, Express, PostgreSQL, and Docker.

## Fork & Launch

```bash
git clone https://github.com/BinGiTexh/job-platform-template.git my-job-site
cd my-job-site
cp .env.example .env
# Edit .env — at minimum set DB_PASSWORD, JWT_SECRET, and your branding
docker compose up -d --build
```

That's it. The API container runs migrations automatically on startup. Your site is live at:

| Service  | URL                    |
|----------|------------------------|
| Frontend | http://localhost:3000   |
| API      | http://localhost:5000   |
| pgAdmin  | http://localhost:5050   |
| Health   | http://localhost:5000/health |

## White-Label Branding

All branding is driven by environment variables. Change these in `.env` and the site rebrands on next container restart:

```env
SITE_NAME=Caribbean Tech Jobs
SITE_TAGLINE=Build Your Tech Career in the Caribbean
PRIMARY_COLOR=#0891B2
SECONDARY_COLOR=#D946EF
CURRENCY=USD
CURRENCY_SYMBOL=$
LOGO_URL=/logo.svg
```

The frontend fetches `/api/config` on load, generates CSS custom properties from your colors, and applies them to all gradients, buttons, and brand elements. No code changes needed.

## Architecture

```
docker-compose.yml          # Orchestrates all services
.env.example                # Template — copy to .env
backend/
  server.js                 # Express app with security middleware
  middleware/auth.js         # JWT auth + role guards (ADMIN, EMPLOYER, JOBSEEKER)
  routes/
    auth.routes.js           # Register, login
    jobs.routes.js           # CRUD + search, employer management, view tracking
    applications.routes.js   # Apply, list, status updates, withdraw
    profiles.routes.js       # Profile CRUD, photo/resume upload, saved jobs
    companies.routes.js      # Company CRUD, logo upload
    notifications.routes.js  # In-app notifications with unread counts
    payments.routes.js       # Stripe (config-driven, can disable)
    feeds.routes.js          # Feed ingestion trigger + stats
    config.routes.js         # Site config + live platform stats
    redirect.routes.js       # Click-tracking redirect for external apply
  services/
    feedIngestionService.js  # Streaming XML/JSON parser, batch upserts
    paymentService.js        # Stripe integration (optional)
    webhookService.js        # Stripe webhook processing
    jobViewService.js        # View tracking + trending jobs
  prisma/
    schema.prisma            # Full data model (14 models, 9 enums)
    migrations/              # Auto-applied on startup
packages/frontend/
  src/
    context/
      SiteConfigContext.jsx  # Fetches /api/config, sets CSS variables
      AuthContext.jsx         # JWT auth state
      ThemeContext.jsx        # Dark mode
    pages/
      HomePage.jsx           # Config-driven landing page
      JobSearchPage.jsx      # Search with API
      JobDetailsPage.jsx     # Job detail + apply
    components/
      layout/Header.jsx      # Branded header
      layout/Footer.jsx      # Branded footer
      Home/HeroSection.jsx   # Dynamic hero with live stats
```

## API Endpoints

### Public
- `GET /api/config` — site branding + feature flags
- `GET /api/config/stats` — live job/company/user counts
- `GET /api/jobs` — search jobs (`?search=&location=&type=&page=&limit=`)
- `GET /api/jobs/:id` — job detail (tracks views)
- `GET /api/jobs/trending` — most-viewed jobs (7 days)
- `GET /api/companies/:id` — public company profile
- `GET /api/payments/pricing` — pricing info (if Stripe enabled)

### Authenticated
- `POST /api/auth/register` — create account
- `POST /api/auth/login` — get JWT token
- `GET /api/profiles/me` — profile with completion percentage
- `PUT /api/profiles/me` — update profile
- `POST /api/profiles/me/photo` — upload profile photo
- `POST /api/profiles/me/resume` — upload resume
- `GET /api/profiles/saved-jobs` — saved jobs list
- `POST /api/profiles/saved-jobs/:jobId` — save a job
- `DELETE /api/profiles/saved-jobs/:jobId` — unsave a job
- `GET /api/notifications` — list notifications
- `GET /api/notifications/count` — unread count
- `PATCH /api/notifications/mark-all-read` — mark all read

### Job Seeker
- `POST /api/applications/:jobId/apply` — apply to a job
- `GET /api/applications/my-applications` — list my applications
- `DELETE /api/applications/:jobId/applications/:id` — withdraw

### Employer
- `POST /api/jobs` — create job posting
- `PUT /api/jobs/:id` — update job
- `PATCH /api/jobs/:id/status` — close/reopen job
- `DELETE /api/jobs/:id` — delete job
- `GET /api/jobs/:id/stats` — view/application stats
- `GET /api/applications/:jobId/applications` — list applicants
- `PATCH /api/applications/:jobId/applications/:id` — update status
- `POST /api/companies` — create company
- `PUT /api/companies/mine` — update company
- `POST /api/companies/mine/logo` — upload logo

### Admin
- `POST /api/feeds/ingest` — trigger feed ingestion
- `POST /api/payments/refund` — process refund

## Feed Ingestion

The platform supports importing jobs from external XML/JSON feeds (Appcast-style). The ingestion service uses a streaming SAX parser and batch upserts to handle 1M+ jobs without loading the entire feed into memory.

```bash
# Trigger ingestion (requires admin token)
curl -X POST http://localhost:5000/api/feeds/ingest \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feedUrl":"https://example.com/feed.xml","source":"appcast"}'
```

Jobs are deduped by `externalJobId` via upsert. Batch size is 5,000 with progress logging every 10,000 jobs.

## Stripe Payments (Optional)

Payments are disabled by default. To enable:

```env
STRIPE_ENABLED=true
STRIPE_SECRET_KEY=sk_...
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

Supports: job posting payments, featured listings, subscriptions (Basic/Premium), refunds.

## Database

PostgreSQL with Prisma ORM. Models: User, Profile, Company, Job, Application, SavedJob, Notification, JobView, Payment, Subscription, Refund, WebhookEvent.

Migrations run automatically when the API container starts. To run manually:

```bash
docker compose run --rm api npx prisma migrate deploy
```

To create a new migration during development:

```bash
docker compose run --rm api npx prisma migrate dev --name describe_change
```

## Security

- Helmet for HTTP headers
- Rate limiting: 100 req/15min (API), 20 req/15min (auth)
- JWT authentication with role-based access control
- File upload validation (type, size limits)
- Stripe webhook signature verification
- `.gitignore` hardened for the fork model (no secrets, keys, or credentials committed)

## Development

```bash
docker compose logs -f api        # API logs
docker compose logs -f frontend   # Frontend logs (Vite HMR)
docker compose exec db psql -U postgres -d jobplatform  # DB shell
```

Hot reload is enabled for both frontend (Vite HMR) and backend (nodemon).

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide icons
- **Backend**: Node.js 22, Express, Prisma ORM
- **Database**: PostgreSQL 15
- **Infrastructure**: Docker Compose, Redis (available for caching/queues)
- **Security**: Helmet, express-rate-limit, JWT, bcrypt

## License

MIT
