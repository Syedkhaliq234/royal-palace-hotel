/**
 * PRODUCTION CONFIGURATION
 * ========================
 * This is the ONLY file you should need to edit after deploying the
 * backend (see /server/README.md). Both index.html and admin.html load
 * this file and read window.HOTEL_API_BASE_URL from it.
 *
 * Set this to your deployed backend's public URL, e.g.:
 *   window.HOTEL_API_BASE_URL = "https://api.royalpalacehotel.com";
 *
 * Set this to your Stripe PUBLISHABLE key (starts with pk_) once you have
 * a Stripe account — this is safe to expose in frontend code, that's what
 * publishable keys are for. NEVER put a secret key (sk_...) here or
 * anywhere in frontend code.
 *   window.STRIPE_PUBLISHABLE_KEY = "pk_test_...";
 *
 * Leave either as an empty string during local development/preview — both
 * pages detect this and show an honest "not configured" state instead of
 * pretending bookings/admin/newsletter/payments work.
 */
window.HOTEL_API_BASE_URL = "";
window.STRIPE_PUBLISHABLE_KEY = "";
