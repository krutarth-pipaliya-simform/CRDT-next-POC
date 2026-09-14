import { z } from "zod";

export const subscriptionPlanSchema = z.enum(["FREE", "PRO"]);
export type SubscriptionPlanValue = z.infer<typeof subscriptionPlanSchema>;

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
