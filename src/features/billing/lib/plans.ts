import type { AnalyticsRangeValue } from "@/schemas/analytics";
import type { PaidPlanValue, SubscriptionPlanValue } from "@/schemas/billing";

export interface PlanDefinition {
    id: SubscriptionPlanValue;
    name: string;
    /** Display price, already formatted — the authoritative amount lives in Stripe. */
    price: string;
    cadence: string;
    tagline: string;
    features: string[];
    /** Analytics history windows this plan may select. */
    analyticsRanges: AnalyticsRangeValue[];
}

export const PLANS: Record<SubscriptionPlanValue, PlanDefinition> = {
    FREE: {
        id: "FREE",
        name: "Free",
        price: "$0",
        cadence: "forever",
        tagline: "Everything needed to run a single collaborating team.",
        features: [
            "Unlimited members and documents",
            "Realtime document editing and chat",
            "Kanban board and notifications",
            "7-day analytics history",
        ],
        analyticsRanges: ["7d"],
    },
    PRO: {
        id: "PRO",
        name: "Pro",
        price: "$12",
        cadence: "per workspace / month",
        tagline: "Longer history and reporting for teams that review the data.",
        features: [
            "Everything in Free",
            "30- and 90-day analytics history",
            "Contributor leaderboard and priority mix",
            "Stripe-managed billing portal",
        ],
        analyticsRanges: ["7d", "30d", "90d"],
    },
    ENTERPRISE: {
        id: "ENTERPRISE",
        name: "Enterprise",
        price: "$49",
        cadence: "per workspace / month",
        tagline:
            "A year of history for organisations that plan by the quarter.",
        features: [
            "Everything in Pro",
            "12-month analytics history",
            "In-app invoice and payment history",
            "Switch plans with prorated billing",
        ],
        analyticsRanges: ["7d", "30d", "90d", "365d"],
    },
};

export const PLAN_ORDER: SubscriptionPlanValue[] = [
    "FREE",
    "PRO",
    "ENTERPRISE",
];

export const PAID_PLANS: PaidPlanValue[] = ["PRO", "ENTERPRISE"];

/** Whether moving from one plan to another is an upgrade (by catalog order). */
export function isUpgrade(
    from: SubscriptionPlanValue,
    to: SubscriptionPlanValue,
): boolean {
    return PLAN_ORDER.indexOf(to) > PLAN_ORDER.indexOf(from);
}

/** The cheapest plan that includes an analytics window, for "locked" labels. */
export function cheapestPlanWithRange(
    range: AnalyticsRangeValue,
): SubscriptionPlanValue {
    return (
        PLAN_ORDER.find((plan) =>
            PLANS[plan].analyticsRanges.includes(range),
        ) ?? "ENTERPRISE"
    );
}

/** Whether a plan is allowed to query the given analytics window. */
export function planAllowsRange(
    plan: SubscriptionPlanValue,
    range: AnalyticsRangeValue,
): boolean {
    return PLANS[plan].analyticsRanges.includes(range);
}
