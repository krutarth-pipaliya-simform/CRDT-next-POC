import * as React from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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

export function CardHeader({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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

export function CardTitle({
    className,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
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

export function CardBody({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn("text-sm text-brand-subtle", className)}
            {...props}
        />
    );
}
