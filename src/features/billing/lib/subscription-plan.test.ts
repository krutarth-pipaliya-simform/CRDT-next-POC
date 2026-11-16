import { resolveEffectivePlan } from "@/features/billing/lib/subscription-plan";

describe("resolveEffectivePlan", () => {
    it.each([
        ["PRO", "ACTIVE", "PRO"],
        ["PRO", "TRIALING", "PRO"],
        ["ENTERPRISE", "ACTIVE", "ENTERPRISE"],
        ["ENTERPRISE", "TRIALING", "ENTERPRISE"],
    ] as const)("keeps %s while %s", (plan, status, expected) => {
        expect(resolveEffectivePlan(plan, status)).toBe(expected);
    });

    it.each([
        ["PRO", "PAST_DUE"],
        ["PRO", "CANCELED"],
        ["PRO", "INCOMPLETE"],
        ["ENTERPRISE", "PAST_DUE"],
        ["ENTERPRISE", "CANCELED"],
        ["ENTERPRISE", "INCOMPLETE"],
    ] as const)("reads a lapsed %s (%s) as FREE", (plan, status) => {
        expect(resolveEffectivePlan(plan, status)).toBe("FREE");
    });

    it("is FREE for a free plan whatever the status", () => {
        expect(resolveEffectivePlan("FREE", "ACTIVE")).toBe("FREE");
        expect(resolveEffectivePlan("FREE", "TRIALING")).toBe("FREE");
    });
});
