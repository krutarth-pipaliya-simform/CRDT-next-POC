import {
    changeSubscriptionPlanSchema,
    createCheckoutSessionSchema,
    createPortalSessionSchema,
    paidPlanSchema,
    setCancelAtPeriodEndSchema,
    stripeMetadataSchema,
    subscriptionPlanSchema,
    subscriptionStatusSchema,
} from "@/schemas/billing";

describe("billing schemas", () => {
    it("knows the free plan but never treats it as purchasable", () => {
        expect(subscriptionPlanSchema.safeParse("FREE").success).toBe(true);
        expect(paidPlanSchema.safeParse("FREE").success).toBe(false);
        expect(paidPlanSchema.safeParse("ENTERPRISE").success).toBe(true);
    });

    it("lists the supported subscription statuses", () => {
        expect(subscriptionStatusSchema.options).toContain("PAST_DUE");
        expect(subscriptionStatusSchema.safeParse("PAUSED").success).toBe(
            false,
        );
    });

    it("defaults checkout to the Pro plan", () => {
        expect(
            createCheckoutSessionSchema.parse({ workspaceId: "w1" }).plan,
        ).toBe("PRO");
    });

    it("rejects a checkout without a workspace or for a free plan", () => {
        expect(
            createCheckoutSessionSchema.safeParse({ workspaceId: "" }).success,
        ).toBe(false);
        expect(
            createCheckoutSessionSchema.safeParse({
                workspaceId: "w1",
                plan: "FREE",
            }).success,
        ).toBe(false);
    });

    it("requires an explicit paid plan to change plan", () => {
        expect(
            changeSubscriptionPlanSchema.safeParse({ workspaceId: "w1" })
                .success,
        ).toBe(false);
        expect(
            changeSubscriptionPlanSchema.safeParse({
                workspaceId: "w1",
                plan: "ENTERPRISE",
            }).success,
        ).toBe(true);
    });

    it("requires a boolean for cancel-at-period-end", () => {
        expect(
            setCancelAtPeriodEndSchema.safeParse({
                workspaceId: "w1",
                cancel: "true",
            }).success,
        ).toBe(false);
        expect(
            setCancelAtPeriodEndSchema.safeParse({
                workspaceId: "w1",
                cancel: false,
            }).success,
        ).toBe(true);
    });

    it("validates portal and metadata payloads", () => {
        expect(createPortalSessionSchema.safeParse({}).success).toBe(false);
        expect(
            stripeMetadataSchema.safeParse({ workspaceId: "" }).success,
        ).toBe(false);
        expect(
            stripeMetadataSchema.safeParse({ workspaceId: "w1" }).success,
        ).toBe(true);
    });
});
