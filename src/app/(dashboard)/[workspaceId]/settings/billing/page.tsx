import { notFound } from "next/navigation";

import { BillingPanel } from "@/features/billing/components/billing-panel";
import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription";
import { isStripeConfigured } from "@/lib/stripe";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface BillingSettingsPageProps {
    params: Promise<{ workspaceId: string }>;
    searchParams: Promise<{ checkout?: string }>;
}

function parseCheckoutOutcome(value?: string): "success" | "cancelled" | null {
    if (value === "success" || value === "cancelled") {
        return value;
    }
    return null;
}

export default async function BillingSettingsPage({
    params,
    searchParams,
}: BillingSettingsPageProps) {
    const [{ workspaceId }, { checkout }] = await Promise.all([
        params,
        searchParams,
    ]);

    // The settings layout already restricts this route to admins; the query
    // re-verifies membership independently so billing data cannot leak.
    const subscription = await getWorkspaceSubscription(workspaceId);
    if (!subscription) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h3 className="text-lg font-medium text-brand-ink">
                    Plan & Billing
                </h3>
                <p className="text-xs text-brand-subtle">
                    Subscriptions are billed per workspace and managed by
                    Stripe.
                </p>
            </div>

            <BillingPanel
                workspaceId={workspaceId}
                subscription={subscription}
                stripeConfigured={isStripeConfigured()}
                checkoutOutcome={parseCheckoutOutcome(checkout)}
            />
        </div>
    );
}
