import {
    cheapestPlanWithRange,
    isUpgrade,
    PAID_PLANS,
    PLAN_ORDER,
    planAllowsRange,
    PLANS,
} from "@/features/billing/lib/plans";

describe("plan catalog", () => {
    it("has an entry for every ordered plan, keyed by its own id", () => {
        for (const id of PLAN_ORDER) {
            expect(PLANS[id].id).toBe(id);
        }
        expect(PAID_PLANS).toEqual(["PRO", "ENTERPRISE"]);
    });

    it("widens the analytics history with each tier", () => {
        expect(PLANS.FREE.analyticsRanges).toEqual(["7d"]);
        expect(PLANS.PRO.analyticsRanges).toEqual(["7d", "30d", "90d"]);
        expect(PLANS.ENTERPRISE.analyticsRanges).toContain("365d");
    });
});

describe("isUpgrade", () => {
    it("is true only when moving up the catalog order", () => {
        expect(isUpgrade("FREE", "PRO")).toBe(true);
        expect(isUpgrade("PRO", "ENTERPRISE")).toBe(true);
        expect(isUpgrade("ENTERPRISE", "PRO")).toBe(false);
        expect(isUpgrade("PRO", "PRO")).toBe(false);
    });
});

describe("planAllowsRange", () => {
    it("gates ranges by plan", () => {
        expect(planAllowsRange("FREE", "7d")).toBe(true);
        expect(planAllowsRange("FREE", "30d")).toBe(false);
        expect(planAllowsRange("PRO", "90d")).toBe(true);
        expect(planAllowsRange("PRO", "365d")).toBe(false);
        expect(planAllowsRange("ENTERPRISE", "365d")).toBe(true);
    });
});

describe("cheapestPlanWithRange", () => {
    it("names the first plan that includes the range", () => {
        expect(cheapestPlanWithRange("7d")).toBe("FREE");
        expect(cheapestPlanWithRange("30d")).toBe("PRO");
        expect(cheapestPlanWithRange("365d")).toBe("ENTERPRISE");
    });
});
