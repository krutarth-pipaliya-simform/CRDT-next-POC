"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { reportError } from "@/lib/report-error";
import { getStripeContext, priceIdForPlan } from "@/lib/stripe";
import { getAppUrl } from "@/lib/url";
import { createCheckoutSessionSchema } from "@/schemas/billing";

export type CreateCheckoutSessionResult =
    | { success: true; data: { url: string } }
    | { success: false; error: string };

/**
 * Start a Stripe Checkout Session that upgrades a Free workspace to a paid
 * plan. A workspace that already pays switches plan in place instead
 * (`changeSubscriptionPlanAction`), so it never ends up with two subscriptions.
 *
 * The workspace id is stamped into both the session metadata and the resulting
 * subscription metadata, which is how the webhook attributes the payment later —
 * the success URL is never trusted for that.
 */
export async function createCheckoutSessionAction(
    input: unknown,
): Promise<CreateCheckoutSessionResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const validated = createCheckoutSessionSchema.safeParse(
        input instanceof FormData ? Object.fromEntries(input.entries()) : input,
    );
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { workspaceId, plan } = validated.data;

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
    const { stripe } = stripeContext.data;
    const priceId = priceIdForPlan(stripeContext.data, plan);
    if (!priceId) {
        return {
            success: false,
            error: "The Enterprise plan is not configured. Set STRIPE_ENTERPRISE_PRICE_ID.",
        };
    }

    const [workspace, existing] = await Promise.all([
        db.workspace.findUnique({
            where: { id: workspaceId },
            select: { id: true, name: true },
        }),
        db.subscription.findUnique({ where: { workspaceId } }),
    ]);

    if (!workspace) {
        return { success: false, error: "Workspace not found" };
    }

    if (
        existing &&
        existing.plan !== "FREE" &&
        (existing.status === "ACTIVE" || existing.status === "TRIALING")
    ) {
        return {
            success: false,
            error: "This workspace already has a paid plan. Switch plans instead.",
        };
    }

    try {
        const baseUrl = await getAppUrl();

        // Reuse the workspace's Stripe customer so repeat upgrades keep one
        // billing history instead of spawning a customer per checkout.
        let customerId = existing?.stripeCustomerId ?? null;
        if (!customerId) {
            const customer = await stripe.customers.create({
                name: workspace.name,
                email: session.user.email ?? undefined,
                metadata: { workspaceId },
            });
            customerId = customer.id;

            await db.subscription.upsert({
                where: { workspaceId },
                create: { workspaceId, stripeCustomerId: customerId },
                update: { stripeCustomerId: customerId },
            });
        }

        const checkout = await stripe.checkout.sessions.create({
            mode: "subscription",
            customer: customerId,
            line_items: [{ price: priceId, quantity: 1 }],
            client_reference_id: workspaceId,
            metadata: { workspaceId },
            subscription_data: { metadata: { workspaceId } },
            success_url: `${baseUrl}/${workspaceId}/settings/billing?checkout=success`,
            cancel_url: `${baseUrl}/${workspaceId}/settings/billing?checkout=cancelled`,
        });

        if (!checkout.url) {
            return {
                success: false,
                error: "Stripe did not return a checkout URL",
            };
        }

        return { success: true, data: { url: checkout.url } };
    } catch (error) {
        reportError("[billing] checkout session failed", error);
        return { success: false, error: "Failed to start checkout" };
    }
}
