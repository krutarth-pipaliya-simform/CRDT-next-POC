"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { SubscriptionStatusValue } from "@/schemas/billing";

import { createCheckoutSessionAction } from "../actions/create-checkout-session";
import { createPortalSessionAction } from "../actions/create-portal-session";
import { PLANS, PLAN_ORDER } from "../lib/plans";
import type { WorkspaceSubscription } from "../types";

import { PlanBadge } from "./plan-badge";

export interface BillingPanelProps {
    workspaceId: string;
    subscription: WorkspaceSubscription;
    /** False when Stripe env vars are absent — the page says so instead of failing on click. */
    stripeConfigured: boolean;
    /** `?checkout=` value Stripe appended when returning from the hosted page. */
    checkoutOutcome: "success" | "cancelled" | null;
}

const STATUS_COPY: Record<SubscriptionStatusValue, string> = {
    ACTIVE: "Active",
    TRIALING: "Trialing",
    PAST_DUE: "Payment past due",
    CANCELED: "Cancelled",
    INCOMPLETE: "Awaiting payment confirmation",
};

function formatDate(date: Date | null): string | null {
    if (!date) return null;
    return new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
    }).format(date);
}

export function BillingPanel({
    workspaceId,
    subscription,
    stripeConfigured,
    checkoutOutcome,
}: BillingPanelProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const currentPlan = subscription.effectivePlan;
    const renewsOn = formatDate(subscription.currentPeriodEnd);

    // Both flows hand back a Stripe-hosted URL; the browser leaves the app for it.
    const redirectTo = (
        run: () => Promise<
            | { success: true; data: { url: string } }
            | { success: false; error: string }
        >,
    ) => {
        setError(null);
        startTransition(async () => {
            const result = await run();
            if (!result.success) {
                setError(result.error);
                return;
            }
            window.location.href = result.data.url;
        });
    };

    const handleUpgrade = () =>
        redirectTo(() => createCheckoutSessionAction({ workspaceId }));

    const handleManage = () =>
        redirectTo(() => createPortalSessionAction({ workspaceId }));

    return (
        <div className="flex flex-col gap-8" data-testid="billing-panel">
            {checkoutOutcome === "success" && (
                <Alert intent="success" data-testid="checkout-success">
                    Payment received. The Pro plan activates as soon as Stripe
                    confirms the subscription.
                </Alert>
            )}
            {checkoutOutcome === "cancelled" && (
                <Alert intent="warning" data-testid="checkout-cancelled">
                    Checkout was cancelled. This workspace is unchanged.
                </Alert>
            )}
            {!stripeConfigured && (
                <Alert intent="warning" data-testid="stripe-unconfigured">
                    Stripe is not configured. Set STRIPE_SECRET_KEY,
                    STRIPE_WEBHOOK_SECRET and STRIPE_PRO_PRICE_ID to enable
                    checkout.
                </Alert>
            )}
            {error && (
                <Alert intent="danger" data-testid="billing-error">
                    {error}
                </Alert>
            )}

            <section
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border border-brand-line rounded-brand bg-brand-surface"
                data-testid="current-plan"
                data-plan={currentPlan}
            >
                <div className="flex flex-col gap-1">
                    <span className="text-[12px] text-brand-subtle">
                        Current plan
                    </span>
                    <div className="flex items-center gap-3">
                        <span className="text-lg font-semibold text-brand-ink">
                            {PLANS[currentPlan].name}
                        </span>
                    </div>
                    <span className="text-xs text-brand-subtle">
                        {STATUS_COPY[subscription.status]}
                        {renewsOn &&
                            currentPlan === "PRO" &&
                            (subscription.cancelAtPeriodEnd
                                ? ` · ends ${renewsOn}`
                                : ` · renews ${renewsOn}`)}
                    </span>
                </div>

                {subscription.hasStripeCustomer && (
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleManage}
                        disabled={isPending || !stripeConfigured}
                        data-testid="manage-billing-button"
                    >
                        {isPending ? "Opening..." : "Manage Billing"}
                    </Button>
                )}
            </section>

            <div className="grid gap-6 sm:grid-cols-2">
                {PLAN_ORDER.map((planId) => {
                    const plan = PLANS[planId];
                    const isCurrent = planId === currentPlan;

                    return (
                        <section
                            key={planId}
                            data-testid={`plan-card-${planId.toLowerCase()}`}
                            className={cn(
                                "flex flex-col gap-4 p-5 border-2 rounded-brand transition-colors",
                                isCurrent
                                    ? "border-brand-accent bg-brand-muted/40"
                                    : "border-brand-border bg-brand-surface",
                            )}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h4 className="text-base font-semibold text-brand-ink">
                                        {plan.name}
                                    </h4>
                                    <p className="text-xs text-brand-subtle mt-1">
                                        {plan.tagline}
                                    </p>
                                </div>
                                {isCurrent && <PlanBadge plan={planId} />}
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-medium text-brand-ink">
                                    {plan.price}
                                </span>
                                <span className="text-xs text-brand-subtle">
                                    {plan.cadence}
                                </span>
                            </div>

                            <ul className="flex flex-col gap-2">
                                {plan.features.map((feature) => (
                                    <li
                                        key={feature}
                                        className="flex items-start gap-2 text-sm text-brand-subtle"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className="text-brand-accent"
                                        >
                                            ✓
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {planId === "PRO" && !isCurrent && (
                                <Button
                                    type="button"
                                    size="sm"
                                    onClick={handleUpgrade}
                                    disabled={isPending || !stripeConfigured}
                                    data-testid="upgrade-button"
                                >
                                    {isPending
                                        ? "Redirecting..."
                                        : "Upgrade to Pro"}
                                </Button>
                            )}
                        </section>
                    );
                })}
            </div>
        </div>
    );
}
