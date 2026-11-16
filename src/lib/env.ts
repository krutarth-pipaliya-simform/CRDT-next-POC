import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.url(), // Works for both postgres:// and prisma://
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    NEXT_PUBLIC_WS_URL: z.url().optional(),

    // Canonical public origin (e.g. https://app.example.com). When set, links in
    // emails are built from it instead of the request's Host header, which a
    // client controls.
    APP_URL: z.url().optional(),

    // Billing (Stripe). Optional at boot so the app still starts without billing
    // configured; `src/lib/stripe.ts` reports the gap where it actually matters.
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    STRIPE_PRO_PRICE_ID: z.string().min(1).optional(),
    // Optional on its own: without it the Enterprise plan is shown but cannot
    // be bought, and the rest of billing works as before.
    STRIPE_ENTERPRISE_PRICE_ID: z.string().min(1).optional(),

    // Headless CMS (Strapi v5 REST). Optional at boot: without them the
    // content pages render a "not configured" notice. See `cms/README.md`.
    CMS_API_URL: z.url().optional(),
    CMS_API_TOKEN: z.string().min(1).optional(),
    // Shared secret a Strapi webhook sends to POST /api/cms/revalidate.
    CMS_REVALIDATE_SECRET: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
