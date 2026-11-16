import { env } from "@/lib/env";
import {
    getStripeContext,
    isEnterpriseConfigured,
    isStripeConfigured,
    planForPriceId,
    priceIdForPlan,
} from "@/lib/stripe";

jest.mock("@/lib/env", () => ({ env: {} }));

function configure(values: Partial<typeof env>) {
    for (const key of Object.keys(env)) {
        Reflect.deleteProperty(env, key);
    }
    Object.assign(env, values);
}

const FULL = {
    STRIPE_SECRET_KEY: "sk_test_123",
    STRIPE_WEBHOOK_SECRET: "whsec_123",
    STRIPE_PRO_PRICE_ID: "price_pro",
};

afterEach(() => {
    globalThis.stripeClient = undefined;
});

describe("stripe configuration", () => {
    it("is unconfigured without the three required variables", () => {
        configure({});
        expect(isStripeConfigured()).toBe(false);

        configure({ STRIPE_SECRET_KEY: "sk_test_123" });
        expect(isStripeConfigured()).toBe(false);

        const result = getStripeContext();
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toMatch(/Billing is not configured/);
        }
    });

    it("returns a context with a singleton client when configured", () => {
        configure(FULL);
        expect(isStripeConfigured()).toBe(true);

        const first = getStripeContext();
        const second = getStripeContext();
        expect(first.success && second.success).toBe(true);
        if (first.success && second.success) {
            expect(first.data.stripe).toBe(second.data.stripe);
            expect(first.data.proPriceId).toBe("price_pro");
            expect(first.data.enterprisePriceId).toBeNull();
            expect(first.data.webhookSecret).toBe("whsec_123");
        }
    });

    it("reports Enterprise only when its price is set", () => {
        configure(FULL);
        expect(isEnterpriseConfigured()).toBe(false);

        configure({ ...FULL, STRIPE_ENTERPRISE_PRICE_ID: "price_ent" });
        expect(isEnterpriseConfigured()).toBe(true);

        configure({ STRIPE_ENTERPRISE_PRICE_ID: "price_ent" });
        expect(isEnterpriseConfigured()).toBe(false);
    });
});

describe("price <-> plan mapping", () => {
    it("picks the price for each paid plan", () => {
        configure({ ...FULL, STRIPE_ENTERPRISE_PRICE_ID: "price_ent" });
        const result = getStripeContext();
        if (!result.success) throw new Error("expected a context");

        expect(priceIdForPlan(result.data, "PRO")).toBe("price_pro");
        expect(priceIdForPlan(result.data, "ENTERPRISE")).toBe("price_ent");
    });

    it("returns null for an Enterprise plan that is not set up", () => {
        configure(FULL);
        const result = getStripeContext();
        if (!result.success) throw new Error("expected a context");
        expect(priceIdForPlan(result.data, "ENTERPRISE")).toBeNull();
    });

    it("derives the plan from the price, defaulting to Pro", () => {
        configure({ ...FULL, STRIPE_ENTERPRISE_PRICE_ID: "price_ent" });
        expect(planForPriceId("price_ent")).toBe("ENTERPRISE");
        expect(planForPriceId("price_pro")).toBe("PRO");
        expect(planForPriceId("price_old")).toBe("PRO");
        expect(planForPriceId(null)).toBe("PRO");
    });

    it("never maps an unset Enterprise price onto Enterprise", () => {
        configure(FULL);
        expect(planForPriceId(null)).toBe("PRO");
    });
});
