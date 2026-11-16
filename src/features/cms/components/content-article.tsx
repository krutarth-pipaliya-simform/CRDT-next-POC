import type { ReactNode } from "react";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { BackLink, type BackLinkProps } from "@/components/paddock/back-link";
import { ContourBackground } from "@/components/paddock/contour-background";
import { Tag } from "@/components/paddock/tag";

import { BlocksRenderer } from "./blocks-renderer";
import type { BlockNode } from "../schemas/blocks";

export interface ContentArticleProps {
    back: Omit<BackLinkProps, "className">;
    eyebrow?: ReactNode;
    title: string;
    lead?: string | null;
    body: BlockNode[];
    footer?: ReactNode;
}

/**
 * One piece of CMS content on its own page: a way back, the title as the
 * page's `h1`, then the rich-text body in a reading column.
 */
export function ContentArticle({
    back,
    eyebrow,
    title,
    lead,
    body,
    footer,
}: ContentArticleProps) {
    return (
        <main>
            <section className="relative overflow-hidden">
                <ContourBackground pattern="hero" />
                <div
                    className={`${PAGE_CONTAINER} relative pt-10 pb-10 sm:pt-12`}
                >
                    <BackLink {...back} className="mb-6" />
                    {eyebrow ? (
                        <Tag as="p" className="mb-4">
                            {eyebrow}
                        </Tag>
                    ) : null}
                    <h1 className="paddock-heavy m-0 max-w-[24ch] text-[clamp(2rem,5vw,3.75rem)]">
                        {title}
                    </h1>
                    {lead ? (
                        <p className="m-0 mt-5 max-w-[62ch] text-lg text-paddock-subtle">
                            {lead}
                        </p>
                    ) : null}
                </div>
            </section>
            <article className={`${PAGE_CONTAINER} pb-20`}>
                <div className="max-w-[46rem]">
                    <BlocksRenderer blocks={body} />
                    {footer}
                </div>
            </article>
        </main>
    );
}
