import type { SubscriptionStatus } from "@prisma/client";
import type Stripe from "stripe";

import { db } from "@/lib/db";

import "server-only";

/**
 * Stripe's subscription lifecycle collapsed onto the statuses this app reasons
 * about. Anything terminal reads as `CANCELED` so entitlement checks stay binary.
 */
function mapStatus(status: Stripe.Subscription.Status): SubscriptionStatus {
    switch (status) {
        case "active":
            return "ACTIVE";
        case "trialing":
            return "TRIALING";
        case "past_due":
        case "unpaid":
            return "PAST_DUE";
        case "incomplete":
            return "INCOMPLETE";
        default:
            // canceled, incomplete_expired, paused
            return "CANCELED";
    }
}

function resolveCustomerId(
    customer: Stripe.Subscription["customer"],
): string | null {
    return typeof customer === "string" ? customer : (customer?.id ?? null);
}

/**
 * The billing period moved onto subscription items in the 2025+ API versions, so
 * the renewal date is read from the first item rather than the subscription.
 */
function resolvePeriodEnd(subscription: Stripe.Subscription): Date | null {
    const periodEnd = subscription.items.data[0]?.current_period_end;
    return typeof periodEnd === "number" ? new Date(periodEnd * 1000) : null;
}

/**
 * Whether the subscription is scheduled to end rather than renew.
 *
 * A cancellation booked through the billing portal arrives as a `cancel_at`
 * timestamp with `cancel_at_period_end` still false, so reading the boolean
 * alone would show "renews" on a subscription that is on its way out.
 */
function resolveCancelAtPeriodEnd(subscription: Stripe.Subscription): boolean {
    return subscription.cancel_at_period_end || subscription.cancel_at !== null;
}

/**
 * Write a Stripe subscription onto the workspace it belongs to. Used by every
 * webhook branch so checkout, renewal and cancellation all converge on one shape.
 */
export async function syncSubscriptionToWorkspace(
    workspaceId: string,
    subscription: Stripe.Subscription,
): Promise<void> {
    const status = mapStatus(subscription.status);
    const stripeCustomerId = resolveCustomerId(subscription.customer);
    const stripePriceId = subscription.items.data[0]?.price?.id ?? null;
    const currentPeriodEnd = resolvePeriodEnd(subscription);

    const data = {
        plan: "PRO" as const,
        status,
        stripeCustomerId,
        stripeSubscriptionId: subscription.id,
        stripePriceId,
        cancelAtPeriodEnd: resolveCancelAtPeriodEnd(subscription),
        currentPeriodEnd,
    };

    await db.subscription.upsert({
        where: { workspaceId },
        create: { workspaceId, ...data },
        update: data,
    });
}

/**
 * Drop a workspace back to Free. Called when Stripe reports the subscription is
 * gone, so the workspace keeps a row (and its customer id) but loses entitlement.
 */
export async function downgradeWorkspaceToFree(
    workspaceId: string,
    subscription: Stripe.Subscription,
): Promise<void> {
    await db.subscription.updateMany({
        where: { workspaceId },
        data: {
            plan: "FREE",
            status: "CANCELED",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: resolvePeriodEnd(subscription),
        },
    });
}
