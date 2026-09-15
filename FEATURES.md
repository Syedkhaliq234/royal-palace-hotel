# Features — Royal Palace Hotel Platform

This document separates what's **implemented and working** from what
**requires external configuration** (a real database, payment provider,
email provider, and domain — none of which can be invented or faked).
No feature listed below is exaggerated to look more expensive than it is.

---

## ✅ Implemented — Public Website

| Feature | Details |
|---|---|
| Luxury homepage | Hero, rooms, dining, pool, spa, amenities sections — custom-designed, not a template |
| Room browsing | Room cards pull live data (name, price, description) from the database via the API |
| Booking form | Real client + server-side validation (dates, guest count, email, phone), honeypot spam protection |
| Real-time availability | Server checks actual room inventory and existing bookings — never trusts the browser |
| Double-booking prevention | Database transaction with row-level locking — two guests cannot book the same room for overlapping dates |
| Server-computed pricing | The price shown and charged is calculated server-side from the database, not sent by the browser |
| Unique booking references | Generated server-side (e.g. `RPH-8F2K9Q`) |
| Newsletter signup | Real subscribe form with duplicate prevention and validation |
| Responsive layout | Built with mobile, tablet, and desktop breakpoints throughout |
| SEO foundation | Meta tags, Open Graph, Twitter Cards, structured data (Hotel/LocalBusiness/Breadcrumb schema) — no fake ratings or reviews inserted |

## ✅ Implemented — Admin Dashboard

| Feature | Details |
|---|---|
| Secure login | Real backend authentication — bcrypt password hashing, server-side sessions, no password stored in any frontend file |
| Session security | httpOnly + secure cookies, session regeneration on login, CSRF protection on every state-changing action |
| Role-based access | Admin/manager/staff roles enforced server-side on every protected route |
| Bookings management | View, confirm, cancel reservations — reads/writes the real database |
| Room management | Add/edit/deactivate rooms, prices, descriptions — persists to the database |
| Customer records | Guest contact info and booking history, tied to real bookings |
| Newsletter management | Search, view, delete subscribers, export to CSV |
| Site settings | Hotel name, address, phone, currency — editable from the dashboard, reflected live on the website |

## ✅ Implemented — Security Architecture

| Feature | Details |
|---|---|
| Password hashing | bcrypt, never plaintext |
| CSRF protection | Every admin state-changing request requires a verified token |
| Rate limiting | Login, booking, newsletter, and payment endpoints all throttled against abuse |
| SQL injection protection | Every database query is parameterized — no string concatenation |
| CSV injection protection | Subscriber export escapes formula-injection characters |
| Payment authorization | Booking payments require a 256-bit server-generated token (not a guessable booking ID) — see DEPLOYMENT.md for detail |
| No secrets in frontend | Verified by search — zero API keys, passwords, or session secrets in any HTML/JS file shipped to the browser |

## 🔧 Implemented, Requires External Configuration — Payments

The complete Stripe integration is written and code-reviewed, front-to-back:
- Backend: PaymentIntent creation, webhook signature verification, idempotent payment status updates
- Frontend: after booking creation, the site automatically requests a payment session (authorized by a 256-bit token, not a guessable booking ID), loads Stripe.js, and shows a Stripe Payment Element matching the site's design
- The frontend never marks a booking as paid itself — only the backend webhook does that, after Stripe confirms the charge

**It has not been tested against a real Stripe account** — this requires:
- A Stripe account and API keys (test mode, then live)
- Running `npm install` to pull in the Stripe SDK
- A webhook endpoint configured in the Stripe dashboard
- Setting the publishable key in `config.js`

Until configured, guests can still complete a booking — they just see an
honest "online payment is currently unavailable, please contact the hotel
directly" message instead of a payment form.

## 🔧 Implemented, Requires External Configuration — Email

Booking confirmation and admin notification emails are fully coded against
the Resend API. **Not tested against a real account** — requires:
- A Resend account and API key
- A verified sending domain

Until configured, the system logs a clear warning and does not claim an
email was sent.

## 🔧 Requires External Configuration — Infrastructure

| Item | What's needed |
|---|---|
| Database | A real PostgreSQL instance (schema is ready to run — see DEPLOYMENT.md) |
| Domain | A registered production domain (placeholder is clearly marked, never invented) |
| Hosting | Any Node.js host with HTTPS (Render, Railway, Fly.io, a VPS) |

## What this is not

- Not a page-builder template — every line of the backend was written for
  this project
- Not a demo — the booking form does not fake success; if the backend
  isn't connected, it says so
- Not "fully live" until the items above are configured — this document
  will not tell you otherwise
