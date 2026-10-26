"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { paddockFieldClasses } from "@/components/paddock/paddock-styles";
import { cn } from "@/lib/cn";

export interface WorkspaceSearchBarProps {
    tabName: string;
    initialQuery?: string;
    placeholder?: string;
}

export function WorkspaceSearchBar({
    tabName,
    initialQuery = "",
    placeholder = "Search workspaces by name...",
}: WorkspaceSearchBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(initialQuery);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        startTransition(() => {
            const params = new URLSearchParams(
                searchParams ? searchParams.toString() : "",
            );
            params.set("tab", tabName);
            params.set("page", "1");
            if (query.trim()) {
                params.set("query", query.trim());
            } else {
                params.delete("query");
            }
            router.push(`/dashboard?${params.toString()}`);
        });
    };

    const handleClear = () => {
        setQuery("");
        startTransition(() => {
            const params = new URLSearchParams(
                searchParams ? searchParams.toString() : "",
            );
            params.set("tab", tabName);
            params.set("page", "1");
            params.delete("query");
            router.push(`/dashboard?${params.toString()}`);
        });
    };

    return (
        <form
            role="search"
            onSubmit={handleSubmit}
            className="mb-7 flex w-full max-w-160 flex-wrap items-center gap-2.5"
        >
            <label htmlFor="search-workspaces" className="sr-only">
                Search workspaces
            </label>
            <input
                id="search-workspaces"
                name="query"
                type="search"
                placeholder={placeholder}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={cn(
                    paddockFieldClasses,
                    "h-13 min-w-0 flex-[1_1_20rem]",
                )}
            />
            <PaddockButton
                type="submit"
                variant="outline"
                className="h-13"
                disabled={isPending}
            >
                {isPending ? "..." : "Search"}
            </PaddockButton>
            {initialQuery && (
                <PaddockButton
                    variant="ghost"
                    className="h-13"
                    onClick={handleClear}
                    disabled={isPending}
                >
                    Clear
                </PaddockButton>
            )}
        </form>
    );
}
