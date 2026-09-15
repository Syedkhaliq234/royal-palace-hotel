# Royal Palace Hotel — Premium Custom Hotel Booking Platform

A custom-built hotel website and booking platform: a luxury frontend backed
by a real Node.js/Express/PostgreSQL application — not a template, not a
demo, not a page builder export.

This README is the starting point. Also see:
- **[FEATURES.md](FEATURES.md)** — what's implemented vs. what needs external configuration
- **[DEPLOYMENT.md](DEPLOYMENT.md)** — how to actually put this live
- **[server/README.md](server/README.md)** — backend-specific setup detail

## What's in this project

```
├── index.html          Public website (rooms, booking, newsletter)
├── admin.html           Admin dashboard (bookings, rooms, settings, newsletter)
├── config.js             Single file to set your production API URL
└── server/                Backend application
    ├── app.js               Express app entry point
    ├── db.js                 PostgreSQL connection
    ├── schema.sql              Database schema
    ├── routes/                   API endpoints (auth, bookings, rooms, etc.)
    ├── middleware/                 Auth + CSRF protection
    ├── lib/                          Business logic (pricing, availability, validation, tokens, email)
    ├── scripts/seed-admin.js           Creates the first admin account
    ├── tests/logic.test.js               50 automated tests
    └── README.md                           Backend setup instructions
```

## Honest status

This is real, working code — not a mockup. Every backend file has been
syntax-verified and 50 automated tests pass (business logic: pricing math,
date validation, availability overlap detection, CSV-injection protection,
authorization token verification). See the **Final QA Report** at the
bottom of this file for exactly what has and hasn't been tested, and why.

What it is **not** yet: live. It has never been deployed, connected to a
real PostgreSQL database, or tested against real Stripe/Resend accounts,
because the environment this was built in has no network access or
database available. Getting from "correct code" to "actually running" is
covered step-by-step in [DEPLOYMENT.md](DEPLOYMENT.md).

## Quick orientation

**For the hotel owner:** see [FEATURES.md](FEATURES.md) for what this
platform does for your business, in plain terms.

**For whoever deploys this:** see [DEPLOYMENT.md](DEPLOYMENT.md) for the
full checklist — database, environment variables, Stripe, Resend, domain,
HTTPS.

**For a developer extending this:** see [server/README.md](server/README.md)
for API structure, testing, and architecture notes.

---

## Final QA Report (this delivery)

## Final production checklist (this delivery)

| # | Item | Status |
|---|---|---|
| 1 | Production domain configuration | Documented, not invented — see `config.js` and `ALLOWED_ORIGINS` in `.env.example` |
| 2 | Production API URL | `config.js` → `window.HOTEL_API_BASE_URL`, empty by default |
| 3 | PostgreSQL environment variables | `DATABASE_URL`, `PGSSL` in `.env.example` |
| 4 | Stripe publishable key | `config.js` → `window.STRIPE_PUBLISHABLE_KEY`, empty by default |
| 5 | Stripe secret key | `STRIPE_SECRET_KEY` in `.env.example`, empty |
| 6 | Stripe webhook secret | `STRIPE_WEBHOOK_SECRET` in `.env.example`, empty |
| 7 | Resend API configuration | `EMAIL_API_KEY`, `EMAIL_FROM`, `HOTEL_NOTIFICATION_EMAIL` in `.env.example` |
| 8 | HTTPS requirement | Documented in DEPLOYMENT.md; enforced in code via `secure: IS_PRODUCTION` cookie flag |
| 9 | Database migration/schema instructions | `server/schema.sql` + DEPLOYMENT.md step 1 |
| 10 | Backup instructions | DEPLOYMENT.md "Backups" section (`pg_dump`/`psql` restore) |
| 11 | Production start command | `npm start` — documented explicitly in DEPLOYMENT.md step 5 |
| 12 | Environment variable documentation | `.env.example` — every entry verified against actual `process.env.*` usage in code, no gaps, no unused entries |

**Note on this pass:** while preparing this checklist, `.env.example` was
found to be missing from the project entirely (lost at some point across
many prior revisions). It has been reconstructed and cross-verified
line-by-line against every `process.env.*` reference in the codebase —
confirmed to now contain exactly the 14 variables the code actually
reads, no more, no less.

**Actual tests performed:**
- `node --check` syntax validation on all 18 backend JavaScript files — all pass
- `node --test` — 50 automated unit tests covering pricing calculations,
  date/stay validation, email validation, CSV formula-injection escaping,
  availability overlap detection, payment-authorization token
  generation/verification, XSS-escaping behavior, and a source-level
  regression check that the payment-status endpoint stays POST (never GET
  with the token in a URL) — **50/50 pass**
- Manual code-path tracing for: room UUID → booking flow, admin
  authentication → session → CSRF flow, Stripe authorization flow,
  webhook signature verification wiring, newsletter CRUD + CSRF coverage
- Full route-by-route audit: all 23 API routes confirmed to have
  correct authentication/authorization/CSRF/rate-limiting for their purpose
- Domain/placeholder/secret search across the entire project

**What was NOT tested (and why):**
- No live PostgreSQL connection, schema execution, or booking persistence —
  this environment has no Postgres binary and no network access to reach
  a managed database
- No live double-booking concurrency test — requires a running server and
  real database to fire simultaneous requests against
- No live Stripe test-mode payment or webhook delivery — no credentials,
  no network
- No live Resend email delivery — no credentials, no network
- No live browser/mobile rendering test — this is a code environment, not
  a browser; responsive behavior was verified by reviewing CSS (media
  queries, viewport meta tags, overflow rules), not by rendering

**External configuration required before launch:**
1. PostgreSQL database (any managed provider — Render, Railway, Supabase, Neon)
2. Stripe account + API keys (test mode first, then live)
3. Resend account + API key
4. A registered production domain
5. Hosting for the Node backend with HTTPS

**Remaining known issues:** none identified in this pass beyond the
external configuration items above.

**Final status: 🟡 PRODUCTION-READY CODE / EXTERNAL CONFIGURATION REQUIRED**

Not 🟢 "actually tested" — that status requires the live tests listed
above, which need real infrastructure this environment doesn't have.
Once deployed with real credentials, re-running through the checklist in
DEPLOYMENT.md will get you to a genuinely verified 🟢 state.
