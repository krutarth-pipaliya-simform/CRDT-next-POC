import { z } from "zod";

const envSchema = z.object({
    DATABASE_URL: z.url(), // Works for both postgres:// and prisma://
    AUTH_SECRET: z.string().min(1),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    NEXT_PUBLIC_WS_URL: z.url().optional(),

    // Billing (Stripe). Optional at boot so the app still starts without billing
    // configured; `src/lib/stripe.ts` reports the gap where it actually matters.
    STRIPE_SECRET_KEY: z.string().min(1).optional(),
    STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
    STRIPE_PRO_PRICE_ID: z.string().min(1).optional(),
});

export const env = envSchema.parse(process.env);
