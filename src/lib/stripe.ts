import Stripe from "stripe";

import { env } from "@/lib/env";

import "server-only";

/**
 * Everything billing needs from the environment, proven present in one place so
 * callers never have to null-check individual variables.
 */
export interface StripeContext {
    stripe: Stripe;
    proPriceId: string;
    webhookSecret: string;
}

export type StripeContextResult =
    { success: true; data: StripeContext } | { success: false; error: string };

const MISSING_CONFIG_ERROR =
    "Billing is not configured. Set STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET and STRIPE_PRO_PRICE_ID.";

function createStripeClient(secretKey: string): Stripe {
    // The API version is intentionally omitted: stripe-node pins the version it
    // was generated against, which keeps the SDK types and the wire format aligned.
    return new Stripe(secretKey, {
        appInfo: {
            name: "crdt-next-poc",
        },
    });
}

/**
 * Lazily instantiated singleton — a new Stripe client per hot reload would leak
 * keep-alive sockets in development.
 */
function getStripeClient(secretKey: string): Stripe {
    if (!globalThis.stripeClient) {
        globalThis.stripeClient = createStripeClient(secretKey);
    }
    return globalThis.stripeClient;
}

/** True when every Stripe variable required to run a checkout is present. */
export function isStripeConfigured(): boolean {
    return Boolean(
        env.STRIPE_SECRET_KEY &&
        env.STRIPE_WEBHOOK_SECRET &&
        env.STRIPE_PRO_PRICE_ID,
    );
}

/**
 * Resolve the Stripe client and price configuration, or a readable error.
 * Returns a discriminated union so callers never assert on possibly-undefined env vars.
 */
export function getStripeContext(): StripeContextResult {
    const secretKey = env.STRIPE_SECRET_KEY;
    const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
    const proPriceId = env.STRIPE_PRO_PRICE_ID;

    if (!secretKey || !webhookSecret || !proPriceId) {
        return { success: false, error: MISSING_CONFIG_ERROR };
    }

    return {
        success: true,
        data: {
            stripe: getStripeClient(secretKey),
            proPriceId,
            webhookSecret,
        },
    };
}
