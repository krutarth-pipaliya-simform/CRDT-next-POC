"use server";

import { revalidatePath } from "next/cache";
import type Stripe from "stripe";

import { setCancelAtPeriodEndSchema } from "@/schemas/billing";

import { getManagedSubscription } from "../lib/managed-subscription";
import { syncSubscriptionToWorkspace } from "../lib/sync-subscription";

export type SetCancelAtPeriodEndResult =
    | { success: true; data: { cancelAtPeriodEnd: boolean } }
    | { success: false; error: string };

/**
 * Cancel a paid plan at the end of the period it is paid up to, or take that
 * cancellation back. The workspace keeps its plan until then; Stripe sends
 * `customer.subscription.deleted` when the period ends, which drops it to Free.
 *
 * A cancellation booked in the billing portal arrives as a `cancel_at`
 * timestamp rather than `cancel_at_period_end`, and Stripe accepts only one of
 * the two per request, so resuming clears whichever one is set.
 */
export async function setCancelAtPeriodEndAction(
    input: unknown,
): Promise<SetCancelAtPeriodEndResult> {
    const validated = setCancelAtPeriodEndSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId, cancel } = validated.data;

    const managed = await getManagedSubscription(workspaceId);
    if (!managed.success) {
        return managed;
    }
    const { stripeContext, subscription } = managed.data;

    if (!subscription?.stripeSubscriptionId || subscription.plan === "FREE") {
        return {
            success: false,
            error: "This workspace has no paid plan to cancel",
        };
    }

    try {
        const { stripe } = stripeContext;
        const current = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId,
        );

        const params: Stripe.SubscriptionUpdateParams = cancel
            ? { cancel_at_period_end: true }
            : current.cancel_at_period_end
              ? { cancel_at_period_end: false }
              : { cancel_at: "" };

        const updated = await stripe.subscriptions.update(current.id, params);
        await syncSubscriptionToWorkspace(workspaceId, updated);
    } catch (error) {
        console.error("[billing] cancellation change failed", error);
        return {
            success: false,
            error: cancel
                ? "Stripe could not cancel the plan"
                : "Stripe could not resume the plan",
        };
    }

    revalidatePath(`/${workspaceId}`, "layout");
    return { success: true, data: { cancelAtPeriodEnd: cancel } };
}
