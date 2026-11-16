"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { reportError } from "@/lib/report-error";
import { getStripeContext } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";
import { createPortalSessionSchema } from "@/schemas/billing";

export type CreatePortalSessionResult =
    | { success: true; data: { url: string } }
    | { success: false; error: string };

/**
 * Open the Stripe-hosted billing portal for a workspace so an admin can update
 * a card, download invoices, or cancel. Cancellations come back as webhooks.
 */
export async function createPortalSessionAction(
    input: unknown,
): Promise<CreatePortalSessionResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = createPortalSessionSchema.safeParse(
        input instanceof FormData ? Object.fromEntries(input.entries()) : input,
    );
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId } = validated.data;

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
        select: { stripeCustomerId: true },
    });

    if (!subscription?.stripeCustomerId) {
        return {
            success: false,
            error: "This workspace has no billing history yet",
        };
    }

    try {
        const baseUrl = await getAppUrl();
        const portal =
            await stripeContext.data.stripe.billingPortal.sessions.create({
                customer: subscription.stripeCustomerId,
                return_url: `${baseUrl}/${workspaceId}/settings/billing`,
            });

        return { success: true, data: { url: portal.url } };
    } catch (error) {
        reportError("[billing] portal session failed", error);
        return { success: false, error: "Failed to open the billing portal" };
    }
}
