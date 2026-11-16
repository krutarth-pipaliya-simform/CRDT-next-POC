import { ChevronLeft, ChevronRight } from "lucide-react";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { paddockButtonClasses } from "@/components/paddock/paddock-styles";

import type { Pagination } from "../schemas/content";

export interface ContentPaginationProps {
    basePath: string;
    pagination: Pagination;
}

const DISABLED_PAGE = paddockButtonClasses({
    variant: "outline",
    voice: "plain",
    size: "sm",
});

function pageHref(basePath: string, page: number): string {
    return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

/** Server-rendered Previous/Next links; page 1 has no query string. */
export function ContentPagination({
    basePath,
    pagination,
}: ContentPaginationProps) {
    const { page, pageCount, total } = pagination;
    if (pageCount <= 1) return null;

    return (
        <nav
            aria-label="Pagination"
            className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-paddock-rule pt-4.5"
        >
            <span className="paddock-mono text-[0.78125rem] text-paddock-subtle">
                Page {page} of {pageCount} · {total} in total
            </span>
            <span className="flex items-center gap-2">
                {page > 1 ? (
                    <PaddockLinkButton
                        href={pageHref(basePath, page - 1)}
                        variant="outline"
                        voice="plain"
                        size="sm"
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Newer
                    </PaddockLinkButton>
                ) : (
                    <span aria-disabled="true" className={DISABLED_PAGE}>
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Newer
                    </span>
                )}
                {page < pageCount ? (
                    <PaddockLinkButton
                        href={pageHref(basePath, page + 1)}
                        variant="outline"
                        voice="plain"
                        size="sm"
                    >
                        Older
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </PaddockLinkButton>
                ) : (
                    <span aria-disabled="true" className={DISABLED_PAGE}>
                        Older
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </span>
                )}
            </span>
        </nav>
    );
}
