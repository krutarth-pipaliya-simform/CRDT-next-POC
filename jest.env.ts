// Runs before every test file. Unit tests never need a real database, network
// or `.env`: modules that validate the environment at import time get fixed,
// fake values here, and every optional integration is switched off so results
// do not depend on the developer's local `.env`.
Object.assign(process.env, {
    DATABASE_URL: "postgres://test:test@localhost:5432/test",
    AUTH_SECRET: "test-secret",
});

for (const name of [
    "AUTH_GOOGLE_ID",
    "AUTH_GOOGLE_SECRET",
    "NEXT_PUBLIC_WS_URL",
    "APP_URL",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "STRIPE_PRO_PRICE_ID",
    "STRIPE_ENTERPRISE_PRICE_ID",
    "CMS_API_URL",
    "CMS_API_TOKEN",
    "CMS_REVALIDATE_SECRET",
    "SENTRY_DSN",
    "NEXT_PUBLIC_SENTRY_DSN",
    "SENTRY_ORG",
    "SENTRY_PROJECT",
    "SENTRY_AUTH_TOKEN",
]) {
    delete process.env[name];
}
