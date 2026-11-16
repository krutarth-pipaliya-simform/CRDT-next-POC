import { paddockPillBase } from "@/components/paddock/paddock-styles";
import { cn } from "@/lib/cn";
import type { SubscriptionPlanValue } from "@/schemas/billing";

import { PLANS } from "../lib/plans";

export interface PlanBadgeProps {
    plan: SubscriptionPlanValue;
    className?: string;
}

const PLAN_TREATMENT: Record<SubscriptionPlanValue, string> = {
    FREE: "border-[1.5px] border-paddock-ink text-paddock-ink",
    PRO: "border-[1.5px] border-paddock-lime bg-paddock-lime text-paddock-on-fill",
    ENTERPRISE:
        "border-[1.5px] border-paddock-inverse bg-paddock-inverse text-paddock-on-inverse",
};

/**
 * The workspace's plan as a pill. Pro is lime with on-fill text, Enterprise
 * an inverse fill, Free an ink outline. The word carries the state, so the
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
                PLAN_TREATMENT[plan],
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
