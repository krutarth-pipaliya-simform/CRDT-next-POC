import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * For surfaces that genuinely float above the page — dialogs, menus, a card
     * mid-drag. A resting card in a list is not elevated; it sits on the paper
     * and is separated by a rule.
     */
    elevated?: boolean;
    /** Adds hover affordance. Only for cards that are themselves a link or button. */
    interactive?: boolean;
}

/**
 * Elevation is rationed. When every card in a grid carries a 4px hard shadow
 * the shadow stops meaning "raised" and starts meaning "card", and the page
 * shouts in nine places at once. Default is flat on a rule; `elevated` is for
 * the few things that really do float.
 */
export function Card({
    className,
    elevated = false,
    interactive = false,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "bg-brand-surface border border-brand-border p-5 rounded-brand",
                "transition-[transform,box-shadow,border-color] duration-100 ease-out",
                elevated && "border-2 border-brand-ink shadow-brand-card",
                interactive &&
                    "hover:border-brand-ink hover:-translate-y-[2px] hover:shadow-brand-subtle",
                className,
            )}
            {...props}
        />
    );
}

export type CardHeaderProps = HTMLAttributes<HTMLDivElement>;

export function CardHeader({ className, ...props }: CardHeaderProps) {
    return (
        <div
            className={cn(
                "flex flex-col gap-1 border-b border-brand-border pb-3 mb-4",
                className,
            )}
            {...props}
        />
    );
}

export type CardTitleProps = HTMLAttributes<HTMLHeadingElement>;

export function CardTitle({ className, ...props }: CardTitleProps) {
    return (
        <h3
            className={cn(
                "text-[17px] font-semibold tracking-[-0.011em] text-brand-ink",
                className,
            )}
            {...props}
        />
    );
}

export type CardBodyProps = HTMLAttributes<HTMLDivElement>;

export function CardBody({ className, ...props }: CardBodyProps) {
    return (
        <div
            className={cn("text-sm text-brand-subtle", className)}
            {...props}
        />
    );
}
