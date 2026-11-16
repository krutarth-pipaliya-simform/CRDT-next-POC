import Stripe from "stripe";

import { env } from "@/lib/env";
import type { PaidPlanValue } from "@/schemas/billing";

import "server-only";

/**
 * Everything billing needs from the environment, proven present in one place so
 * callers never have to null-check individual variables.
 */
export interface StripeContext {
    stripe: Stripe;
    proPriceId: string;
    /** `null` until STRIPE_ENTERPRISE_PRICE_ID is set. */
    enterprisePriceId: string | null;
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
            enterprisePriceId: env.STRIPE_ENTERPRISE_PRICE_ID ?? null,
            webhookSecret,
        },
    };
}

/** True when the Enterprise plan can be bought, on top of the base config. */
export function isEnterpriseConfigured(): boolean {
    return isStripeConfigured() && Boolean(env.STRIPE_ENTERPRISE_PRICE_ID);
}

/** The Stripe price for a paid plan, or `null` when that plan is not set up. */
export function priceIdForPlan(
    context: StripeContext,
    plan: PaidPlanValue,
): string | null {
    return plan === "ENTERPRISE"
        ? context.enterprisePriceId
        : context.proPriceId;
}

/**
 * Which paid plan a Stripe price stands for. The plan is read off the price
 * Stripe reports, never off what the client asked for, so a webhook replay or
 * a portal plan switch always lands on the plan actually being paid for. An
 * unrecognised price (an old Pro price, say) reads as Pro.
 */
export function planForPriceId(priceId: string | null): PaidPlanValue {
    if (priceId && priceId === env.STRIPE_ENTERPRISE_PRICE_ID) {
        return "ENTERPRISE";
    }
    return "PRO";
}
