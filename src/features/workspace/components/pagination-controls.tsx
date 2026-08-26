"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationControlsProps {
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
        <div className="flex items-center justify-between pt-6 border-t-2 border-brand-muted mt-6">
            <span className="font-brand-mono text-xs text-brand-subtle">
                Showing page {currentPage} of {totalPages} ({totalCount} total)
            </span>

            <div className="flex items-center gap-2">
                {currentPage > 1 ? (
                    <Link
                        href={createPageUrl(currentPage - 1)}
                        className="px-3 py-1.5 font-brand-mono text-xs uppercase tracking-wider border-2 border-brand-border bg-brand-surface text-brand-ink rounded-brand hover:border-brand-ink transition-colors"
                    >
                        ← Prev
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 font-brand-mono text-xs uppercase tracking-wider border-2 border-brand-muted bg-brand-muted text-brand-subtle rounded-brand cursor-not-allowed opacity-50">
                        ← Prev
                    </span>
                )}

                <span className="font-brand-mono text-xs px-2 text-brand-ink font-semibold">
                    {currentPage} / {totalPages}
                </span>

                {currentPage < totalPages ? (
                    <Link
                        href={createPageUrl(currentPage + 1)}
                        className="px-3 py-1.5 font-brand-mono text-xs uppercase tracking-wider border-2 border-brand-border bg-brand-surface text-brand-ink rounded-brand hover:border-brand-ink transition-colors"
                    >
                        Next →
                    </Link>
                ) : (
                    <span className="px-3 py-1.5 font-brand-mono text-xs uppercase tracking-wider border-2 border-brand-muted bg-brand-muted text-brand-subtle rounded-brand cursor-not-allowed opacity-50">
                        Next →
                    </span>
                )}
            </div>
        </div>
    );
}
