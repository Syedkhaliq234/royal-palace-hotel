# Deployment Guide — Royal Palace Hotel Platform

This is the exact path from "correct code" to "actually live." Follow it
in order. Nothing here has been tested end-to-end in a live environment
by Claude — this environment had no network access or database — so treat
this as a careful, standard deployment procedure to verify as you go, not
a guarantee.

## Requirements

- Node.js 18+
- A PostgreSQL database (managed: Render, Railway, Supabase, or Neon)
- A Stripe account (test mode to start)
- A Resend account
- A registered domain
- A Node hosting platform with HTTPS (Render, Railway, Fly.io, or a VPS)

## 1. Database

Provision a PostgreSQL database from any managed provider. Copy its
connection string.

```bash
cd server
psql "$DATABASE_URL" -f schema.sql
```

This creates all tables: users, rooms, customers, bookings, payments,
subscribers, hotel_settings, sessions — with foreign keys, constraints,
and indexes as designed. Verify it ran cleanly with no errors before
continuing.

## 2. Backend environment

```bash
cp .env.example .env
```

Fill in `.env`:

| Variable | How to get it |
|---|---|
| `DATABASE_URL` | From step 1 |
| `SESSION_SECRET` | Generate: `openssl rand -hex 32` |
| `ALLOWED_ORIGINS` | Your production website domain, e.g. `https://www.royalpalacehotel.com` — the only backend env var for domain/CORS config (the frontend's API URL is set separately in `config.js`, step 8) |
| `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` | Choose your first admin login (12+ char password) |
| `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` | From your Stripe dashboard — see step 5 |
| `EMAIL_API_KEY` / `EMAIL_FROM` | From your Resend dashboard |

Every variable in this table is verified against `.env.example` and actual
`process.env.*` usage in the code — nothing here is invented or unused.

Never commit `.env` to version control.

## 3. Install and seed

```bash
npm install
npm run seed:admin
```

This creates your first admin account. **Remove `SEED_ADMIN_PASSWORD`
from `.env` immediately after this succeeds** — it's no longer needed
and shouldn't sit in a config file.

## 4. Run the tests

```bash
npm test
```

Expect 50/50 passing (pure logic tests — validation, pricing, availability,
authorization tokens, XSS-escaping, and route-structure regression checks).
This does not test against your live database; it's a sanity check that
nothing broke in transit.

## 5. Deploy the backend

Push `server/` to your chosen host (Render, Railway, Fly.io, or a VPS).
Set every `.env` variable as an environment variable in the host's
dashboard. Set `NODE_ENV=production` (most hosts do this automatically).

**Production start command:** `npm start` (runs `node app.js` — defined
in `server/package.json`). Most platforms (Render, Railway) auto-detect
this from `package.json`; on a bare VPS, run it directly or under a
process manager such as `pm2` so it restarts if it crashes.

Verify it's running:
```bash
curl https://your-api-domain.com/api/health
```

## 6. Configure Stripe

1. In the Stripe dashboard, switch to test mode first
2. Copy your test `STRIPE_SECRET_KEY` into `.env` / your host's environment
3. Create a webhook endpoint pointing to `https://your-api-domain.com/api/payments/webhook`, subscribed to `payment_intent.succeeded` and `payment_intent.payment_failed`
4. Copy the webhook signing secret into `STRIPE_WEBHOOK_SECRET`
5. Run `npm install stripe` if you haven't already (it's an optional dependency, only needed once configured)
6. Test with Stripe's documented test card numbers before going live
7. Only after confirming test-mode payments work end-to-end, switch to live keys

## 7. Configure Resend

1. Verify a sending domain in the Resend dashboard
2. Copy your API key into `EMAIL_API_KEY`
3. Set `EMAIL_FROM` to an address on your verified domain
4. Trigger a real test booking and confirm the email arrives

## 8. Connect the frontend

Edit `config.js` (the one file both `index.html` and `admin.html` read from):

```js
window.HOTEL_API_BASE_URL = "https://your-api-domain.com";
window.STRIPE_PUBLISHABLE_KEY = "pk_test_..."; // from step 6, safe to expose in frontend
```

Once both are set, `index.html`'s booking form automatically shows a
real Stripe payment step after booking creation, and an inline
available/unavailable message once room + dates are selected. If
`STRIPE_PUBLISHABLE_KEY` is left blank, bookings still work — guests just
see "online payment is currently unavailable" and are asked to contact
the hotel directly instead.

Deploy `index.html`, `admin.html`, and `config.js` to your web host or CDN
of choice (these are static files — any static host works: Netlify,
Vercel, Cloudflare Pages, or a traditional web server).

## 9. Domain and HTTPS

Point your registered domain at your frontend host. Ensure your backend
host provides HTTPS (Render/Railway/Fly.io do this automatically for
custom domains). Update `ALLOWED_ORIGINS` in the backend's environment to
match your final frontend domain, and `HOTEL_API_BASE_URL` in `config.js`
to match your final backend domain, then redeploy both so CORS accepts
requests from the real domain.

## 10. Verify end-to-end before announcing launch

Walk through the full customer flow yourself: browse rooms → submit a
real booking → confirm it appears in the admin dashboard → confirm the
booking email arrives → (if Stripe is live) complete a real payment.
Then walk through the admin flow: log in → view the booking → mark it
confirmed → check the newsletter tab.

## Backups

- Enable your database provider's automatic backup feature
- Manual backup: `pg_dump "$DATABASE_URL" > backup.sql`
- Manual restore: `psql "$DATABASE_URL" < backup.sql`
- **Test your restore process before you need it** — an unverified backup
  isn't a real backup

## Logging & monitoring

- Application errors are logged to stdout/stderr via `console.error` —
  connect your host's log aggregation (most platforms provide this
  built-in)
- Consider adding a third-party error-tracking service (e.g. Sentry) for
  production visibility — not included in this build, and not invented
  here since it requires its own account/credentials

## Migrations

This project ships one `schema.sql`, not a migration framework. For a
single-hotel deployment this is normally sufficient. If you need to
change the schema after launch, write the `ALTER TABLE` statement by
hand, test it against a copy of production data first, then run it
during a maintenance window. If the schema starts changing frequently,
consider adopting a migration tool such as `node-pg-migrate`.
