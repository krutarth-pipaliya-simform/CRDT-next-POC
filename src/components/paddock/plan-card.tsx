import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

import { NotchedCard } from "./notched-card";

export interface PlanCardProps {
    name: string;
    tagline: string;
    /** Display price, e.g. "$0" or "$12". */
    price: string;
    /** Set in the serif after the price: "forever", "per month". */
    cadence: string;
    features: string[];
    current?: boolean;
    /** The recommended plan is set on night, the only place lime can be text. */
    featured?: boolean;
    /** The plan's action, e.g. an upgrade button. Omitted on the current plan. */
    action?: ReactNode;
    className?: string;
}

/**
 * A plan, as a notched card. Copy, price and limits belong to the plan
 * catalogue (`src/features/billing/lib/plans.ts`); this only lays them out.
 */
export function PlanCard({
    name,
    tagline,
    price,
    cadence,
    features,
    current = false,
    featured = false,
    action,
    className,
}: PlanCardProps) {
    return (
        <NotchedCard
            as="article"
            tone={featured ? "night" : "sheet"}
            className={className}
            bodyClassName="flex flex-col gap-4.5 px-7.5 pt-7.5 pb-14"
        >
            <div className="flex items-center justify-between gap-3">
                <h3 className="paddock-heavy m-0 text-[2.125rem]">{name}</h3>
                {current ? (
                    <span
                        className={cn(
                            "paddock-tag rounded-full px-3 py-1.5 text-[0.6875rem]",
                            featured
                                ? "bg-paddock-lime text-paddock-on-fill"
                                : "bg-paddock-inverse text-paddock-on-inverse",
                        )}
                    >
                        Current plan
                    </span>
                ) : null}
            </div>
            <p
                className={cn(
                    "m-0",
                    featured
                        ? "text-paddock-night-subtle"
                        : "text-paddock-subtle",
                )}
            >
                {tagline}
            </p>
            <p className="m-0 flex flex-wrap items-baseline gap-2.5">
                <span
                    data-numeric
                    className="paddock-heavy text-[clamp(3.5rem,8vw,5.5rem)] leading-[0.85]"
                >
                    {price}
                </span>
                <span
                    className={cn(
                        "paddock-serif text-[1.625rem]",
                        featured ? "text-paddock-lime" : "text-paddock-subtle",
                    )}
                >
                    {cadence}
                </span>
            </p>
            <ul className="m-0 flex list-none flex-col p-0">
                {features.map((feature) => (
                    <li
                        key={feature}
                        className={cn(
                            "flex items-center gap-3 border-t py-2.75",
                            featured
                                ? "border-paddock-night-rule"
                                : "border-paddock-rule",
                        )}
                    >
                        <span
                            aria-hidden="true"
                            className={cn(
                                "flex size-5.5 shrink-0 items-center justify-center rounded-full",
                                featured
                                    ? "bg-paddock-lime text-paddock-on-fill"
                                    : "bg-paddock-inverse text-paddock-on-inverse",
                            )}
                        >
                            <Check className="size-3" strokeWidth={2.6} />
                        </span>
                        {feature}
                    </li>
                ))}
            </ul>
            {action ? <div className="self-start">{action}</div> : null}
        </NotchedCard>
    );
}
