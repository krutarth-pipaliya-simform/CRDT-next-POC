"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface WorkspaceSearchBarProps {
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

    const handleSubmit = (e: React.FormEvent) => {
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
            onSubmit={handleSubmit}
            className="flex items-center gap-3 w-full max-w-lg mb-6"
        >
            <div className="flex-1">
                <Input
                    id="search-workspaces"
                    name="query"
                    type="search"
                    placeholder={placeholder}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search workspaces"
                />
            </div>
            <Button
                type="submit"
                variant="secondary"
                size="md"
                disabled={isPending}
            >
                {isPending ? "..." : "Search"}
            </Button>
            {initialQuery && (
                <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={handleClear}
                    disabled={isPending}
                >
                    Clear
                </Button>
            )}
        </form>
    );
}
