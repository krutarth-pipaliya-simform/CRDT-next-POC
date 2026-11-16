import { z } from "zod";

export const subscriptionPlanSchema = z.enum(["FREE", "PRO", "ENTERPRISE"]);
export type SubscriptionPlanValue = z.infer<typeof subscriptionPlanSchema>;

/** The plans that are bought through Stripe. */
export const paidPlanSchema = z.enum(["PRO", "ENTERPRISE"]);
export type PaidPlanValue = z.infer<typeof paidPlanSchema>;

export const subscriptionStatusSchema = z.enum([
    "ACTIVE",
    "TRIALING",
    "PAST_DUE",
    "CANCELED",
    "INCOMPLETE",
]);
export type SubscriptionStatusValue = z.infer<typeof subscriptionStatusSchema>;

export const createCheckoutSessionSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    plan: paidPlanSchema.default("PRO"),
});

/** Move an existing paid subscription to the other paid plan. */
export const changeSubscriptionPlanSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    plan: paidPlanSchema,
});

/** Book or withdraw a cancellation at the end of the current period. */
export const setCancelAtPeriodEndSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    cancel: z.boolean(),
});

export const createPortalSessionSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
});

/**
 * Metadata this app stamps onto every Checkout Session and Subscription so the
 * webhook can route an event back to a workspace without trusting the client.
 */
export const stripeMetadataSchema = z.object({
    workspaceId: z.string().min(1),
});

export type CreateCheckoutSessionInput = z.infer<
    typeof createCheckoutSessionSchema
>;
export type CreatePortalSessionInput = z.infer<
    typeof createPortalSessionSchema
>;
export type StripeMetadata = z.infer<typeof stripeMetadataSchema>;
export type ChangeSubscriptionPlanInput = z.infer<
    typeof changeSubscriptionPlanSchema
>;
export type SetCancelAtPeriodEndInput = z.infer<
    typeof setCancelAtPeriodEndSchema
>;
