"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "next/navigation";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { paddockButtonClasses } from "@/components/paddock/paddock-styles";

export interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    basePath?: string;
    tabName: string;
}

/** A page that does not exist is shown, but cannot be reached. */
const DISABLED_PAGE = paddockButtonClasses({
    variant: "outline",
    voice: "plain",
    size: "sm",
});

export function PaginationControls({
    currentPage,
    totalPages,
    totalCount,
    basePath = "/dashboard",
    tabName,
}: PaginationControlsProps) {
    const searchParams = useSearchParams();

    if (totalPages <= 1) {
        return null;
    }

    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(
            searchParams ? searchParams.toString() : "",
        );
        params.set("tab", tabName);
        params.set("page", page.toString());
        return `${basePath}?${params.toString()}`;
    };

    return (
        <nav
            aria-label="Pagination"
            className="mt-9 flex flex-wrap items-center justify-between gap-3 border-t border-paddock-rule pt-4.5"
        >
            <span className="paddock-mono text-[0.78125rem] text-paddock-subtle">
                Page {currentPage} of {totalPages} · {totalCount} in total
            </span>

            <span className="flex items-center gap-2">
                {currentPage > 1 ? (
                    <PaddockLinkButton
                        href={createPageUrl(currentPage - 1)}
                        variant="outline"
                        voice="plain"
                        size="sm"
                    >
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Previous
                    </PaddockLinkButton>
                ) : (
                    <span aria-disabled="true" className={DISABLED_PAGE}>
                        <ChevronLeft className="size-4" aria-hidden="true" />
                        Previous
                    </span>
                )}

                {currentPage < totalPages ? (
                    <PaddockLinkButton
                        href={createPageUrl(currentPage + 1)}
                        variant="outline"
                        voice="plain"
                        size="sm"
                    >
                        Next
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </PaddockLinkButton>
                ) : (
                    <span aria-disabled="true" className={DISABLED_PAGE}>
                        Next
                        <ChevronRight className="size-4" aria-hidden="true" />
                    </span>
                )}
            </span>
        </nav>
    );
}
