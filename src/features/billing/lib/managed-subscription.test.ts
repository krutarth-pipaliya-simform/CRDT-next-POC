import Stripe from "stripe";

import { getManagedSubscription } from "@/features/billing/lib/managed-subscription";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getStripeContext } from "@/lib/stripe";
import { auth, signInAs, signOutSession } from "@/test/mock-auth";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));
jest.mock("@/features/auth/lib/auth", () =>
    jest.requireActual("@/test/mock-auth"),
);
jest.mock("@/features/workspace/lib/rbac", () => ({
    getWorkspaceRole: jest.fn(),
}));
jest.mock("@/lib/stripe", () => ({ getStripeContext: jest.fn() }));

const mockRole = jest.mocked(getWorkspaceRole);
const mockStripe = jest.mocked(getStripeContext);

beforeEach(() => {
    resetDb();
    auth.mockReset();
    mockRole.mockReset();
    mockStripe.mockReset();
});

describe("getManagedSubscription", () => {
    it("refuses a signed-out caller before touching anything else", async () => {
        signOutSession();
        await expect(getManagedSubscription("w1")).resolves.toEqual({
            success: false,
            error: "Unauthorized",
        });
        expect(mockRole).not.toHaveBeenCalled();
    });

    it.each(["MEMBER", "GUEST", null] as const)(
        "refuses the role %s: only admins manage billing",
        async (role) => {
            signInAs("u1");
            mockRole.mockResolvedValue(role);

            await expect(getManagedSubscription("w1")).resolves.toEqual({
                success: false,
                error: "Only workspace admins can manage billing",
            });
            expect(mockStripe).not.toHaveBeenCalled();
        },
    );

    it("surfaces missing Stripe configuration", async () => {
        signInAs("u1");
        mockRole.mockResolvedValue("ADMIN");
        mockStripe.mockReturnValue({ success: false, error: "not configured" });

        await expect(getManagedSubscription("w1")).resolves.toEqual({
            success: false,
            error: "not configured",
        });
        expect(db.subscription.findUnique).not.toHaveBeenCalled();
    });

    it("returns the context and the workspace's subscription for an admin", async () => {
        signInAs("u1");
        mockRole.mockResolvedValue("ADMIN");
        const context = {
            stripe: new Stripe("sk_test_unit"),
            proPriceId: "price_pro",
            enterprisePriceId: null,
            webhookSecret: "whsec",
        };
        mockStripe.mockReturnValue({ success: true, data: context });
        db.subscription.findUnique.mockResolvedValue({ id: "s1" });

        const result = await getManagedSubscription("w1");

        expect(result).toEqual({
            success: true,
            data: { stripeContext: context, subscription: { id: "s1" } },
        });
        expect(db.subscription.findUnique).toHaveBeenCalledWith({
            where: { workspaceId: "w1" },
        });
    });
});
