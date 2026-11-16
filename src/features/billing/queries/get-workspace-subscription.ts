import { cache } from "react";

import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import { resolveEffectivePlan } from "../lib/subscription-plan";
import type { WorkspaceSubscription } from "../types";

import "server-only";

/** A workspace with no subscription row has simply never been upgraded. */
const FREE_SUBSCRIPTION: WorkspaceSubscription = {
    plan: "FREE",
    effectivePlan: "FREE",
    status: "ACTIVE",
    cancelAtPeriodEnd: false,
    currentPeriodEnd: null,
    hasStripeCustomer: false,
    hasStripeSubscription: false,
};

/**
 * Billing state for a workspace, or `null` when the caller is not a member.
 * The membership check is repeated here so a page cannot leak billing data by
 * forgetting its own guard.
 */
export const getWorkspaceSubscription = cache(
    async (workspaceId: string): Promise<WorkspaceSubscription | null> => {
        const role = await getWorkspaceRole(workspaceId);
        if (!role) {
            return null;
        }

        const subscription = await db.subscription.findUnique({
            where: { workspaceId },
        });

        if (!subscription) {
            return FREE_SUBSCRIPTION;
        }

        return {
            plan: subscription.plan,
            effectivePlan: resolveEffectivePlan(
                subscription.plan,
                subscription.status,
            ),
            status: subscription.status,
            cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
            currentPeriodEnd: subscription.currentPeriodEnd,
            hasStripeCustomer: Boolean(subscription.stripeCustomerId),
            hasStripeSubscription: Boolean(subscription.stripeSubscriptionId),
        };
    },
);
