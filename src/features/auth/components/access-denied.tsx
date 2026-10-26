import type { ReactNode } from "react";

import { DisplayHeading } from "@/components/paddock/display-heading";
import { cn } from "@/lib/cn";

export interface AccessDeniedProps {
    /** The status line, e.g. "403 · Access Denied". */
    code: string;
    serif: string;
    heavy: string;
    children: ReactNode;
    /** The ways out, as night-surface link buttons. */
    actions: ReactNode;
}

/**
 * A refusal on a night ground: the status code in lime mono (lime text is
 * legible on night only), the two-voice heading, why, and the way back.
 */
export function AccessDenied({
    code,
    serif,
    heavy,
    children,
    actions,
}: AccessDeniedProps) {
    return (
        <div className="relative max-w-[37.5rem]">
            <p className="paddock-mono m-0 mb-4.5 text-[0.8125rem] text-paddock-lime">
                {code}
            </p>
            <DisplayHeading
                as="h1"
                serif={serif}
                heavy={heavy}
                surface="night"
                className="mb-5.5"
            />
            <p className="m-0 mb-8 max-w-[32.5rem] text-[1.0625rem] text-paddock-night-subtle">
                {children}
            </p>
            <div className="flex flex-wrap gap-2.5">{actions}</div>
        </div>
    );
}

export interface ForbiddenNumeralProps {
    className?: string;
}

/** The outlined "403" behind a refusal. Decoration only; the code is also written out. */
export function ForbiddenNumeral({ className }: ForbiddenNumeralProps) {
    return (
        <span
            aria-hidden="true"
            className={cn(
                "paddock-heavy pointer-events-none absolute top-1/2 -translate-y-1/2 leading-[0.8] text-transparent select-none",
                "[-webkit-text-stroke:2px_var(--color-paddock-lime)]",
                className,
            )}
        >
            403
        </span>
    );
}
