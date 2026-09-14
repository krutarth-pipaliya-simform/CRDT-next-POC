"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    basePath?: string;
    tabName: string;
}

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
        <div className="flex items-center justify-between gap-4 pt-5 border-t border-brand-border mt-6">
            <span className="text-[13px] text-brand-subtle">
                Page {currentPage} of {totalPages} · {totalCount} in total
            </span>

            <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                    <Link
                        href={createPageUrl(currentPage - 1)}
                        className="inline-flex items-center gap-1 h-8 px-2.5 text-[13px] border border-brand-line bg-brand-surface text-brand-ink rounded-brand hover:border-brand-ink transition-colors"
                    >
                        <ChevronLeft
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                        Previous
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-1 h-8 px-2.5 text-[13px] border border-brand-border text-brand-subtle rounded-brand opacity-50 cursor-not-allowed">
                        <ChevronLeft
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                        Previous
                    </span>
                )}

                {currentPage < totalPages ? (
                    <Link
                        href={createPageUrl(currentPage + 1)}
                        className="inline-flex items-center gap-1 h-8 px-2.5 text-[13px] border border-brand-line bg-brand-surface text-brand-ink rounded-brand hover:border-brand-ink transition-colors"
                    >
                        Next
                        <ChevronRight
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </Link>
                ) : (
                    <span className="inline-flex items-center gap-1 h-8 px-2.5 text-[13px] border border-brand-border text-brand-subtle rounded-brand opacity-50 cursor-not-allowed">
                        Next
                        <ChevronRight
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </span>
                )}
            </div>
        </div>
    );
}
