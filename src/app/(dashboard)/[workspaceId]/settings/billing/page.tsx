import { notFound } from "next/navigation";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { BillingPanel } from "@/features/billing/components/billing-panel";
import { getWorkspaceSubscription } from "@/features/billing/queries/get-workspace-subscription";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
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
    const [subscription, workspace] = await Promise.all([
        getWorkspaceSubscription(workspaceId),
        getWorkspace(workspaceId),
    ]);
    if (!subscription || !workspace) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-7 pt-2">
            <div className="flex flex-col gap-2">
                <DisplayHeading
                    as="h2"
                    size="md"
                    layout="inline"
                    serif="Plan and"
                    heavy="billing"
                />
                <p className="m-0 text-paddock-subtle">
                    Subscriptions are billed per workspace and managed by
                    Stripe.
                </p>
            </div>

            <BillingPanel
                workspaceId={workspaceId}
                workspaceName={workspace.name}
                subscription={subscription}
                stripeConfigured={isStripeConfigured()}
                checkoutOutcome={parseCheckoutOutcome(checkout)}
            />
        </div>
    );
}
