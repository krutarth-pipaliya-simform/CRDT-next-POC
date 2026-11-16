"use server";

import { revalidatePath } from "next/cache";

import { reportError } from "@/lib/report-error";
import { priceIdForPlan } from "@/lib/stripe";
import {
    changeSubscriptionPlanSchema,
    type PaidPlanValue,
} from "@/schemas/billing";

import { getManagedSubscription } from "../lib/managed-subscription";
import { isUpgrade } from "../lib/plans";
import { syncSubscriptionToWorkspace } from "../lib/sync-subscription";

export type ChangeSubscriptionPlanResult =
    | { success: true; data: { plan: PaidPlanValue } }
    | { success: false; error: string };

/**
 * Switch a paying workspace between Pro and Enterprise by swapping the price
 * on its existing Stripe subscription. An upgrade is invoiced for the prorated
 * difference straight away; a downgrade leaves a credit on the next invoice.
 *
 * The row is then written from the subscription Stripe returns, not from the
 * requested plan, so the page reflects what Stripe accepted. The
 * `customer.subscription.updated` webhook that follows writes the same values.
 */
export async function changeSubscriptionPlanAction(
    input: unknown,
): Promise<ChangeSubscriptionPlanResult> {
    const validated = changeSubscriptionPlanSchema.safeParse(input);
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId, plan } = validated.data;

    const managed = await getManagedSubscription(workspaceId);
    if (!managed.success) {
        return managed;
    }
    const { stripeContext, subscription } = managed.data;
    const { stripe } = stripeContext;

    if (
        !subscription?.stripeSubscriptionId ||
        subscription.plan === "FREE" ||
        !(
            subscription.status === "ACTIVE" ||
            subscription.status === "TRIALING"
        )
    ) {
        return {
            success: false,
            error: "This workspace has no active paid plan to switch. Upgrade it first.",
        };
    }

    if (subscription.plan === plan) {
        return {
            success: false,
            error: "This workspace is already on that plan",
        };
    }

    const priceId = priceIdForPlan(stripeContext, plan);
    if (!priceId) {
        return {
            success: false,
            error: "The Enterprise plan is not configured. Set STRIPE_ENTERPRISE_PRICE_ID.",
        };
    }

    try {
        const current = await stripe.subscriptions.retrieve(
            subscription.stripeSubscriptionId,
        );
        const item = current.items.data[0];
        if (!item) {
            return {
                success: false,
                error: "The Stripe subscription has no price to replace",
            };
        }

        const updated = await stripe.subscriptions.update(current.id, {
            items: [{ id: item.id, price: priceId }],
            proration_behavior: isUpgrade(subscription.plan, plan)
                ? "always_invoice"
                : "create_prorations",
        });

        await syncSubscriptionToWorkspace(workspaceId, updated);
    } catch (error) {
        reportError("[billing] plan change failed", error);
        return { success: false, error: "Stripe could not change the plan" };
    }

    revalidatePath(`/${workspaceId}`, "layout");
    return { success: true, data: { plan } };
}
