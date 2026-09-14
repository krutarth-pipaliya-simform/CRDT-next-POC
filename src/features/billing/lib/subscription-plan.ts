import type { SubscriptionPlan, SubscriptionStatus } from "@prisma/client";

import type { SubscriptionPlanValue } from "@/schemas/billing";

/** Statuses that still entitle a workspace to the paid feature set. */
const ENTITLED_STATUSES: SubscriptionStatus[] = ["ACTIVE", "TRIALING"];

/**
 * The plan a workspace may actually use. A Pro subscription that has lapsed
 * (`PAST_DUE`, `CANCELED`, `INCOMPLETE`) silently reads as Free so entitlement
 * checks never have to repeat the status logic.
 */
export function resolveEffectivePlan(
    plan: SubscriptionPlan,
    status: SubscriptionStatus,
): SubscriptionPlanValue {
    if (plan === "PRO" && ENTITLED_STATUSES.includes(status)) {
        return "PRO";
    }
    return "FREE";
}
