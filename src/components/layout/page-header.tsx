import type { ReactNode } from "react";

import { BackLink, type BackLinkProps } from "@/components/paddock/back-link";
import { ContourBackground } from "@/components/paddock/contour-background";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";

import { PAGE_CONTAINER } from "./layout-styles";

export interface PageHeaderProps {
    /**
     * The way back up, for a page that is not a top-level section: profile,
     * a workspace's overview. Sits above the eyebrow.
     */
    back?: Omit<BackLinkProps, "className">;
    /** The light half of the two-voice title: "Your". */
    serif?: string;
    /** The weighted half: "workspaces". */
    heavy?: string;
    /**
     * A one-voice title, set in the heavy caps. Kept for callers that have
     * not been given a two-voice title; prefer `serif` and `heavy`.
     */
    title?: string;
    /** A small label above the title: who is signed in, a count, a state. */
    eyebrow?: ReactNode;
    /** One plain sentence about what this page is for. Optional, and usually is. */
    description?: string;
    /** Live context that belongs to the page — a presence cluster, a count. */
    meta?: ReactNode;
    action?: ReactNode;
    className?: string;
}

/**
 * The page hero: faint contour lines behind a two-voice display heading, with
 * the page's primary action on the right. It spans the full width, so render
 * it outside the page's content container.
 */
export function PageHeader({
    back,
    serif,
    heavy,
    title,
    eyebrow,
    description,
    meta,
    action,
    className,
}: PageHeaderProps) {
    return (
        <section className={cn("relative overflow-hidden", className)}>
            <ContourBackground pattern="hero" />
            <div
                className={cn(
                    PAGE_CONTAINER,
                    "relative flex flex-wrap items-end justify-between gap-6 pt-12 pb-10 sm:pt-14 sm:pb-11",
                )}
            >
                <div className="min-w-0">
                    {back ? <BackLink {...back} className="mb-6" /> : null}
                    {eyebrow ? (
                        <Tag as="p" className="mb-4">
                            {eyebrow}
                        </Tag>
                    ) : null}
                    <DisplayHeading
                        as="h1"
                        size="lg"
                        serif={serif ?? ""}
                        heavy={heavy ?? title ?? ""}
                    />
                    {description ? (
                        <p className="m-0 mt-4 max-w-[62ch] text-paddock-subtle">
                            {description}
                        </p>
                    ) : null}
                    {meta ? <div className="mt-4">{meta}</div> : null}
                </div>
                {action ? (
                    <div className="flex flex-wrap items-center gap-2.5">
                        {action}
                    </div>
                ) : null}
            </div>
        </section>
    );
}
