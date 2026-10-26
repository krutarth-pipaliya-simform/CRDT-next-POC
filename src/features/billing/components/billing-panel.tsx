"use client";

import { useState, useTransition } from "react";

import { ContourBackground } from "@/components/paddock/contour-background";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { PlanCard } from "@/components/paddock/plan-card";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";
import type { SubscriptionStatusValue } from "@/schemas/billing";

import { createCheckoutSessionAction } from "../actions/create-checkout-session";
import { createPortalSessionAction } from "../actions/create-portal-session";
import { PLANS, PLAN_ORDER } from "../lib/plans";
import type { WorkspaceSubscription } from "../types";

import { BillingNotice } from "./billing-notice";

export interface BillingPanelProps {
    workspaceId: string;
    subscription: WorkspaceSubscription;
    /** False when Stripe env vars are absent — the page says so instead of failing on click. */
    stripeConfigured: boolean;
    /** `?checkout=` value Stripe appended when returning from the hosted page. */
    checkoutOutcome: "success" | "cancelled" | null;
    /** Names the workspace in the current-plan band. */
    workspaceName?: string;
}

const STATUS_COPY: Record<SubscriptionStatusValue, string> = {
    ACTIVE: "Active",
    TRIALING: "Trialing",
    PAST_DUE: "Payment past due",
    CANCELED: "Cancelled",
    INCOMPLETE: "Awaiting payment confirmation",
};

/** States where the subscription is in good standing get the lime dot. */
const IN_GOOD_STANDING: Record<SubscriptionStatusValue, boolean> = {
    ACTIVE: true,
    TRIALING: true,
    PAST_DUE: false,
    CANCELED: false,
    INCOMPLETE: false,
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
    workspaceName,
}: BillingPanelProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const currentPlan = subscription.effectivePlan;
    const renewsOn = formatDate(subscription.currentPeriodEnd);
    const longerRanges = PLANS.PRO.analyticsRanges
        .filter((range) => !PLANS.FREE.analyticsRanges.includes(range))
        .map((range) => range.replace("d", ""))
        .join(" and ");

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

    const upgradeDisabled = isPending || !stripeConfigured;

    return (
        <div className="flex flex-col gap-7" data-testid="billing-panel">
            {checkoutOutcome === "success" ? (
                <BillingNotice tone="success" data-testid="checkout-success">
                    Payment received. The Pro plan activates as soon as Stripe
                    confirms the subscription.
                </BillingNotice>
            ) : null}
            {checkoutOutcome === "cancelled" ? (
                <BillingNotice tone="warning" data-testid="checkout-cancelled">
                    Checkout was cancelled. This workspace is unchanged.
                </BillingNotice>
            ) : null}
            {!stripeConfigured ? (
                <BillingNotice tone="warning" data-testid="stripe-unconfigured">
                    Stripe is not configured. Set STRIPE_SECRET_KEY,
                    STRIPE_WEBHOOK_SECRET and STRIPE_PRO_PRICE_ID to enable
                    checkout.
                </BillingNotice>
            ) : null}
            {error ? (
                <BillingNotice tone="danger" data-testid="billing-error">
                    {error}
                </BillingNotice>
            ) : null}

            <section
                aria-label="Current plan"
                data-testid="current-plan"
                data-plan={currentPlan}
                className="paddock-night relative overflow-hidden rounded-paddock-panel px-6 py-8 sm:px-8 sm:py-8.5"
            >
                <ContourBackground pattern="panel" surface="night" />
                <div className="relative flex flex-wrap items-end justify-between gap-6">
                    <div className="flex min-w-0 flex-col gap-2.5">
                        <Tag tone="night-subtle">Current plan</Tag>
                        <p className="m-0 leading-[0.84]">
                            <span className="paddock-serif block text-[clamp(2rem,5vw,2.75rem)] text-paddock-lime">
                                {workspaceName ?? "This workspace"} is on
                            </span>{" "}
                            <span className="paddock-heavy block text-[clamp(3.5rem,10vw,6rem)]">
                                {PLANS[currentPlan].name}
                            </span>
                        </p>
                        <p className="paddock-mono m-0 flex items-center gap-2 text-[0.8125rem] text-paddock-night-subtle">
                            <span
                                aria-hidden="true"
                                className={cn(
                                    "size-2 shrink-0 rounded-full",
                                    IN_GOOD_STANDING[subscription.status]
                                        ? "bg-paddock-lime"
                                        : "border-[1.5px] border-paddock-night-subtle",
                                )}
                            />
                            {STATUS_COPY[subscription.status]}
                            {renewsOn &&
                                currentPlan === "PRO" &&
                                (subscription.cancelAtPeriodEnd
                                    ? ` · ends ${renewsOn}`
                                    : ` · renews ${renewsOn}`)}
                        </p>
                    </div>

                    <div className="flex max-w-[22.5rem] flex-col items-start gap-3 sm:items-end">
                        {currentPlan === "FREE" ? (
                            <>
                                <p className="m-0 text-paddock-night-subtle sm:text-right">
                                    Longer analytics history is part of Pro.
                                    Upgrade this workspace to see {longerRanges}{" "}
                                    days.
                                </p>
                                <PaddockButton
                                    surface="night"
                                    onClick={handleUpgrade}
                                    disabled={upgradeDisabled}
                                >
                                    {isPending
                                        ? "Redirecting..."
                                        : "Upgrade to Pro"}
                                </PaddockButton>
                            </>
                        ) : null}
                        {subscription.hasStripeCustomer ? (
                            <PaddockButton
                                variant="outline"
                                voice="plain"
                                surface="night"
                                onClick={handleManage}
                                disabled={isPending || !stripeConfigured}
                                data-testid="manage-billing-button"
                            >
                                {isPending ? "Opening..." : "Manage billing"}
                            </PaddockButton>
                        ) : null}
                    </div>
                </div>
            </section>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))] gap-4">
                {PLAN_ORDER.map((planId) => {
                    const plan = PLANS[planId];
                    const isCurrent = planId === currentPlan;

                    return (
                        <div
                            key={planId}
                            data-testid={`plan-card-${planId.toLowerCase()}`}
                            className="min-w-0"
                        >
                            <PlanCard
                                name={plan.name}
                                tagline={plan.tagline}
                                price={plan.price}
                                cadence={plan.cadence}
                                features={plan.features}
                                current={isCurrent}
                                featured={planId === "PRO"}
                                className="h-full"
                                action={
                                    planId === "PRO" && !isCurrent ? (
                                        <PaddockButton
                                            surface="night"
                                            onClick={handleUpgrade}
                                            disabled={upgradeDisabled}
                                            data-testid="upgrade-button"
                                        >
                                            {isPending
                                                ? "Redirecting..."
                                                : "Upgrade to Pro"}
                                        </PaddockButton>
                                    ) : undefined
                                }
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
