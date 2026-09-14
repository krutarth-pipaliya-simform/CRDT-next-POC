import { Badge } from "@/components/ui/badge";
import type { SubscriptionPlanValue } from "@/schemas/billing";

import { PLANS } from "../lib/plans";

export interface PlanBadgeProps {
    plan: SubscriptionPlanValue;
    className?: string;
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
    return (
        <Badge
            intent={plan === "PRO" ? "default" : "muted"}
            className={className}
            data-testid="plan-badge"
            data-plan={plan}
        >
            {PLANS[plan].name}
        </Badge>
    );
}
