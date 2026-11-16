import type Stripe from "stripe";

import {
    downgradeWorkspaceToFree,
    syncSubscriptionToWorkspace,
} from "@/features/billing/lib/sync-subscription";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));
jest.mock("@/lib/stripe", () => ({
    planForPriceId: (priceId: string | null) =>
        priceId === "price_ent" ? "ENTERPRISE" : "PRO",
}));

interface SubscriptionFixture {
    status?: Stripe.Subscription.Status;
    customer?: Stripe.Subscription["customer"];
    priceId?: string | null;
    periodEnd?: number | undefined;
    cancelAtPeriodEnd?: boolean;
    cancelAt?: number | null;
}

/** The slice of a Stripe subscription the sync reads. */
function subscription(fixture: SubscriptionFixture = {}) {
    const {
        status = "active",
        customer = "cus_1",
        priceId = "price_pro",
        periodEnd = 1_800_000_000,
        cancelAtPeriodEnd = false,
        cancelAt = null,
    } = fixture;
    return {
        id: "sub_1",
        status,
        customer,
        cancel_at_period_end: cancelAtPeriodEnd,
        cancel_at: cancelAt,
        items: {
            data:
                priceId === null
                    ? []
                    : [
                          {
                              price: { id: priceId },
                              current_period_end: periodEnd,
                          },
                      ],
        },
    };
}

beforeEach(() => {
    resetDb();
});

function upsertedData() {
    return db.subscription.upsert.mock.calls[0]?.[0].update;
}

describe("syncSubscriptionToWorkspace", () => {
    it("projects an active Pro subscription onto the workspace row", async () => {
        await syncSubscriptionToWorkspace("w1", subscription());

        const call = db.subscription.upsert.mock.calls[0]?.[0];
        expect(call.where).toEqual({ workspaceId: "w1" });
        expect(call.create).toMatchObject({ workspaceId: "w1", plan: "PRO" });
        expect(call.update).toEqual({
            plan: "PRO",
            status: "ACTIVE",
            stripeCustomerId: "cus_1",
            stripeSubscriptionId: "sub_1",
            stripePriceId: "price_pro",
            cancelAtPeriodEnd: false,
            currentPeriodEnd: new Date(1_800_000_000 * 1000),
        });
    });

    it("takes the plan from the price, not from the request", async () => {
        await syncSubscriptionToWorkspace(
            "w1",
            subscription({ priceId: "price_ent" }),
        );
        expect(upsertedData().plan).toBe("ENTERPRISE");
    });

    it.each([
        ["active", "ACTIVE"],
        ["trialing", "TRIALING"],
        ["past_due", "PAST_DUE"],
        ["unpaid", "PAST_DUE"],
        ["incomplete", "INCOMPLETE"],
        ["incomplete_expired", "CANCELED"],
        ["canceled", "CANCELED"],
        ["paused", "CANCELED"],
    ] as const)("maps Stripe status %s to %s", async (stripe, expected) => {
        await syncSubscriptionToWorkspace(
            "w1",
            subscription({ status: stripe }),
        );
        expect(upsertedData().status).toBe(expected);
    });

    it("reads the customer id from an expanded customer object", async () => {
        const customer: Stripe.Customer = {
            id: "cus_obj",
            object: "customer",
            created: 0,
            livemode: false,
            balance: 0,
            default_source: null,
            description: null,
            email: null,
            metadata: {},
            invoice_settings: {
                custom_fields: null,
                default_payment_method: null,
                footer: null,
                rendering_options: null,
            },
            shipping: null,
            currency: null,
            delinquent: null,
            discount: null,
            address: null,
            name: null,
            phone: null,
            tax_exempt: null,
            test_clock: null,
        };
        await syncSubscriptionToWorkspace("w1", subscription({ customer }));
        expect(upsertedData().stripeCustomerId).toBe("cus_obj");
    });

    it("treats a portal-booked cancel_at as cancel-at-period-end", async () => {
        await syncSubscriptionToWorkspace(
            "w1",
            subscription({ cancelAt: 1_900_000_000 }),
        );
        expect(upsertedData().cancelAtPeriodEnd).toBe(true);

        resetDb();
        await syncSubscriptionToWorkspace(
            "w1",
            subscription({ cancelAtPeriodEnd: true }),
        );
        expect(upsertedData().cancelAtPeriodEnd).toBe(true);
    });

    it("copes with a subscription that has no items", async () => {
        await syncSubscriptionToWorkspace(
            "w1",
            subscription({ priceId: null }),
        );
        expect(upsertedData()).toMatchObject({
            stripePriceId: null,
            currentPeriodEnd: null,
            plan: "PRO",
        });
    });
});

describe("downgradeWorkspaceToFree", () => {
    it("drops the plan and entitlement but keeps the row", async () => {
        await downgradeWorkspaceToFree("w1", subscription());

        expect(db.subscription.updateMany).toHaveBeenCalledWith({
            where: { workspaceId: "w1" },
            data: {
                plan: "FREE",
                status: "CANCELED",
                cancelAtPeriodEnd: false,
                currentPeriodEnd: new Date(1_800_000_000 * 1000),
            },
        });
    });
});
