import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
    elevated?: boolean;
    interactive?: boolean;
}

export function Card({
    className,
    elevated = false,
    interactive = false,
    ...props
}: CardProps) {
    return (
        <div
            className={cn(
                "bg-brand-surface border-2 border-brand-ink p-6 rounded-brand transition-all duration-150 ease-out",
                elevated && "shadow-brand-card",
                interactive &&
                    "hover:-translate-y-1 hover:border-brand-accent hover:shadow-brand-hover",
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
                "flex flex-col gap-1 border-b-2 border-brand-muted pb-4 mb-4",
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
                "text-lg font-semibold tracking-tight text-brand-ink",
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
