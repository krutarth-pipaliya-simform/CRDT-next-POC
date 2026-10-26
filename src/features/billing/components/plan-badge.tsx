import { paddockPillBase } from "@/components/paddock/paddock-styles";
import { cn } from "@/lib/cn";
import type { SubscriptionPlanValue } from "@/schemas/billing";

import { PLANS } from "../lib/plans";

export interface PlanBadgeProps {
    plan: SubscriptionPlanValue;
    className?: string;
}

/**
 * The workspace's plan as a pill. Pro is the only filled one (lime, with
 * on-fill text); Free is an ink outline. The word carries the state, so the
 * fill is never the only signal.
 */
export function PlanBadge({ plan, className }: PlanBadgeProps) {
    return (
        <span
            data-testid="plan-badge"
            data-plan={plan}
            className={cn(
                paddockPillBase,
                "py-1.5",
                plan === "PRO"
                    ? "border-[1.5px] border-paddock-lime bg-paddock-lime text-paddock-on-fill"
                    : "border-[1.5px] border-paddock-ink text-paddock-ink",
                className,
            )}
        >
            <span
                aria-hidden="true"
                className="size-1.5 rounded-full bg-current"
            />
            <span className="sr-only">Plan: </span>
            {PLANS[plan].name}
        </span>
    );
}
