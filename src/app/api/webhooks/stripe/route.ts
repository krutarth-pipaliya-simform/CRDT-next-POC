import { Prisma } from "@prisma/client";
import type Stripe from "stripe";

import {
    downgradeWorkspaceToFree,
    syncSubscriptionToWorkspace,
} from "@/features/billing/lib/sync-subscription";
import { db } from "@/lib/db";
import { reportError } from "@/lib/report-error";
import { getStripeContext } from "@/lib/stripe";
import { stripeMetadataSchema } from "@/schemas/billing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/** Events this endpoint acts on. Everything else is acknowledged and ignored. */
const HANDLED_EVENTS = [
    "checkout.session.completed",
    "customer.subscription.updated",
    "customer.subscription.deleted",
] as const;

type HandledEvent = (typeof HANDLED_EVENTS)[number];

function isHandledEvent(type: string): type is HandledEvent {
    return HANDLED_EVENTS.includes(type as HandledEvent);
}

/**
 * Resolve the workspace an event belongs to. Metadata is the primary route
 * (this app stamps it on every object it creates); the stored subscription id
 * is the fallback for objects created outside the checkout action.
 */
async function resolveWorkspaceId(
    metadata: Stripe.Metadata | null,
    stripeSubscriptionId: string | null,
): Promise<string | null> {
    const parsed = stripeMetadataSchema.safeParse(metadata ?? {});
    if (parsed.success) {
        return parsed.data.workspaceId;
    }

    if (!stripeSubscriptionId) {
        return null;
    }

    const existing = await db.subscription.findUnique({
        where: { stripeSubscriptionId },
        select: { workspaceId: true },
    });

    return existing?.workspaceId ?? null;
}

async function handleCheckoutCompleted(
    stripe: Stripe,
    session: Stripe.Checkout.Session,
): Promise<void> {
    if (session.mode !== "subscription") {
        return;
    }

    const subscriptionId =
        typeof session.subscription === "string"
            ? session.subscription
            : (session.subscription?.id ?? null);

    if (!subscriptionId) {
        console.warn("[stripe-webhook] checkout session without subscription");
        return;
    }

    const workspaceId =
        (await resolveWorkspaceId(session.metadata, subscriptionId)) ??
        session.client_reference_id;

    if (!workspaceId) {
        console.warn(
            "[stripe-webhook] checkout session without a workspace reference",
        );
        return;
    }

    // Fetch the subscription rather than trusting the session snapshot: it
    // carries the authoritative status, price and billing period.
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await syncSubscriptionToWorkspace(workspaceId, subscription);
}

async function handleSubscriptionChanged(
    subscription: Stripe.Subscription,
    deleted: boolean,
): Promise<void> {
    const workspaceId = await resolveWorkspaceId(
        subscription.metadata,
        subscription.id,
    );

    if (!workspaceId) {
        console.warn(
            "[stripe-webhook] subscription event without a workspace reference",
        );
        return;
    }

    if (deleted) {
        await downgradeWorkspaceToFree(workspaceId, subscription);
        return;
    }

    await syncSubscriptionToWorkspace(workspaceId, subscription);
}

/**
 * Stripe webhook receiver.
 *
 * The raw body is read as text because signature verification runs over the
 * exact bytes Stripe signed — parsing to JSON first would invalidate it.
 */
export async function POST(request: Request): Promise<Response> {
    const stripeContext = getStripeContext();
    if (!stripeContext.success) {
        return new Response(stripeContext.error, { status: 503 });
    }
    const { stripe, webhookSecret } = stripeContext.data;

    const signature = request.headers.get("stripe-signature");
    if (!signature) {
        return new Response("Missing stripe-signature header", { status: 400 });
    }

    const payload = await request.text();

    let event: Stripe.Event;
    try {
        event = await stripe.webhooks.constructEventAsync(
            payload,
            signature,
            webhookSecret,
        );
    } catch (error) {
        console.error("[stripe-webhook] signature verification failed", error);
        return new Response("Invalid signature", { status: 400 });
    }

    if (!isHandledEvent(event.type)) {
        return Response.json({ received: true, handled: false });
    }

    // Claim the event before doing any work. Stripe retries deliveries, and the
    // unique primary key turns a replay into a no-op instead of a double write.
    try {
        await db.stripeWebhookEvent.create({
            data: { id: event.id, type: event.type },
        });
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return Response.json({ received: true, duplicate: true });
        }
        reportError("[stripe-webhook] could not record event", error);
        return new Response("Webhook ledger unavailable", { status: 500 });
    }

    try {
        switch (event.type) {
            case "checkout.session.completed":
                await handleCheckoutCompleted(stripe, event.data.object);
                break;
            case "customer.subscription.updated":
                await handleSubscriptionChanged(event.data.object, false);
                break;
            case "customer.subscription.deleted":
                await handleSubscriptionChanged(event.data.object, true);
                break;
        }
    } catch (error) {
        reportError(`[stripe-webhook] ${event.type} failed`, error);
        // Release the claim so Stripe's retry can reprocess this event.
        await db.stripeWebhookEvent
            .delete({ where: { id: event.id } })
            .catch(() => undefined);
        return new Response("Webhook handler failed", { status: 500 });
    }

    return Response.json({ received: true, handled: true });
}
