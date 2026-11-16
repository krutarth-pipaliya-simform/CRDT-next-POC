import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/cn";

import { PaddockLinkButton } from "./paddock-button";

export interface BackLinkProps {
    /** A real parent route, never browser history: it works from a fresh tab. */
    href: string;
    /** What the link returns to, shown beside the arrow: "Documents". */
    label: string;
    /** The full name for assistive tech when the label alone is terse. */
    "aria-label"?: string;
    className?: string;
}

/**
 * The way back up from a page that is not a top-level section: an outline
 * link with a left arrow. It is a link with a real `href`, so it renders on
 * the server, works without JavaScript and opens in a new tab.
 */
export function BackLink({
    href,
    label,
    "aria-label": ariaLabel,
    className,
}: BackLinkProps) {
    return (
        <PaddockLinkButton
            href={href}
            variant="outline"
            voice="plain"
            size="sm"
            aria-label={ariaLabel}
            className={cn("max-w-full shrink-0 px-3.5", className)}
        >
            <ArrowLeft
                className="size-4 shrink-0"
                strokeWidth={2.2}
                aria-hidden="true"
            />
            <span className="truncate">{label}</span>
        </PaddockLinkButton>
    );
}
