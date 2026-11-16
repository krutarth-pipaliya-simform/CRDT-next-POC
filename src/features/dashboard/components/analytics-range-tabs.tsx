import Link from "next/link";
import { Lock } from "lucide-react";

import { PLANS, cheapestPlanWithRange } from "@/features/billing/lib/plans";
import { cn } from "@/lib/cn";
import { RANGE_LABELS, type AnalyticsRangeValue } from "@/schemas/analytics";
import type { SubscriptionPlanValue } from "@/schemas/billing";

export interface AnalyticsRangeTabsProps {
    workspaceId: string;
    activeRange: AnalyticsRangeValue;
    /** Ranges outside this plan's allowance render disabled, tagged with the plan that unlocks them. */
    plan: SubscriptionPlanValue;
}

const RANGES: AnalyticsRangeValue[] = ["7d", "30d", "90d", "365d"];

const SEGMENT =
    "inline-flex h-11 items-center gap-2 whitespace-nowrap rounded-full px-4.5 text-sm font-semibold no-underline";

/**
 * The date-range switch, as a pill track. Each range is a link, because it
 * changes the URL the server reads; the current one carries `aria-current`.
 * A range the plan does not include is a disabled button tagged with the
 * cheapest plan that includes it —
 * the server refuses it anyway, so this only says why it cannot be picked.
 */
export function AnalyticsRangeTabs({
    workspaceId,
    activeRange,
    plan,
}: AnalyticsRangeTabsProps) {
    const allowed = PLANS[plan].analyticsRanges;

    return (
        <nav
            aria-label="Analytics date range"
            className="flex max-w-full flex-wrap gap-1.5 rounded-[1.75rem] border-[1.5px] border-paddock-ink p-[5px]"
        >
            {RANGES.map((range) => {
                const label = RANGE_LABELS[range];

                if (!allowed.includes(range)) {
                    return (
                        <button
                            key={range}
                            type="button"
                            disabled
                            className={cn(
                                SEGMENT,
                                "cursor-not-allowed text-paddock-subtle",
                            )}
                        >
                            {label}
                            <span className="paddock-tag inline-flex items-center gap-1 rounded-full border-[1.5px] border-dashed border-paddock-subtle px-2 py-0.5 text-[0.625rem]">
                                <Lock
                                    aria-hidden="true"
                                    className="size-2.5"
                                    strokeWidth={2.6}
                                />
                                {PLANS[cheapestPlanWithRange(range)].name}
                            </span>
                        </button>
                    );
                }

                const active = range === activeRange;
                return (
                    <Link
                        key={range}
                        href={`/${workspaceId}/analytics?range=${range}`}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                            SEGMENT,
                            "paddock-press",
                            active
                                ? "bg-paddock-inverse text-paddock-on-inverse"
                                : "text-paddock-ink hover:bg-paddock-ink/8",
                        )}
                    >
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
