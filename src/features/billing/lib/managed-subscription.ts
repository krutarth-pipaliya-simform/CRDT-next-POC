import type { Subscription } from "@prisma/client";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { getStripeContext, type StripeContext } from "@/lib/stripe";

import "server-only";

export interface ManagedSubscription {
    stripeContext: StripeContext;
    /** The workspace's subscription row; `null` if it never touched Stripe. */
    subscription: Subscription | null;
}

export type ManagedSubscriptionResult =
    | { success: true; data: ManagedSubscription }
    | { success: false; error: string };

/**
 * The checks every billing mutation and billing read repeats: a signed-in
 * caller, who is an admin of the workspace, with Stripe configured. Resolved on
 * the server from the session on every call, never from client input.
 */
export async function getManagedSubscription(
    workspaceId: string,
): Promise<ManagedSubscriptionResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const role = await getWorkspaceRole(workspaceId);
    if (role !== "ADMIN") {
        return {
            success: false,
            error: "Only workspace admins can manage billing",
        };
    }

    const stripeContext = getStripeContext();
    if (!stripeContext.success) {
        return { success: false, error: stripeContext.error };
    }

    const subscription = await db.subscription.findUnique({
        where: { workspaceId },
    });

    return {
        success: true,
        data: { stripeContext: stripeContext.data, subscription },
    };
}
