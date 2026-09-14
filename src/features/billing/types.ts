import type {
    SubscriptionPlanValue,
    SubscriptionStatusValue,
} from "@/schemas/billing";

export interface WorkspaceSubscription {
    /** Plan recorded on the subscription row, regardless of status. */
    plan: SubscriptionPlanValue;
    /** Plan the workspace may actually use right now (a lapsed Pro reads as Free). */
    effectivePlan: SubscriptionPlanValue;
    status: SubscriptionStatusValue;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: Date | null;
    /** True once the workspace exists in Stripe and can open the billing portal. */
    hasStripeCustomer: boolean;
}
