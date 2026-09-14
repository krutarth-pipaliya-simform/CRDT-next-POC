"use client";

import { Badge } from "@/components/ui/badge";
import { NavTabs, type NavTabItem } from "@/components/ui/nav-tabs";
import { PLANS } from "@/features/billing/lib/plans";
import { RANGE_LABELS, type AnalyticsRangeValue } from "@/schemas/analytics";
import type { SubscriptionPlanValue } from "@/schemas/billing";

export interface AnalyticsRangeTabsProps {
    workspaceId: string;
    activeRange: AnalyticsRangeValue;
    /** Ranges outside this plan's allowance render disabled with a Pro badge. */
    plan: SubscriptionPlanValue;
}

const RANGES: AnalyticsRangeValue[] = ["7d", "30d", "90d"];

export function AnalyticsRangeTabs({
    workspaceId,
    activeRange,
    plan,
}: AnalyticsRangeTabsProps) {
    const allowed = PLANS[plan].analyticsRanges;

    const items: NavTabItem[] = RANGES.map((range) => {
        const locked = !allowed.includes(range);

        return {
            label: RANGE_LABELS[range],
            value: range,
            href: `/${workspaceId}/analytics?range=${range}`,
            disabled: locked,
            badge: locked ? <Badge intent="muted">Pro</Badge> : undefined,
        };
    });

    return (
        <NavTabs
            ariaLabel="Analytics date range"
            items={items}
            activeValue={activeRange}
            size="sm"
            className="border-b-0"
        />
    );
}
