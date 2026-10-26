"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { DisplayHeading } from "@/components/paddock/display-heading";
import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { paddockFieldClasses } from "@/components/paddock/paddock-styles";
import { cn } from "@/lib/cn";

import type { DocumentItem } from "../types";
import { CreateDocumentDialog } from "./create-document-dialog";
import { DocumentCard } from "./document-card";

export interface DocumentListProps {
    documents: DocumentItem[];
    workspaceId: string;
    workspaceName: string;
    userRole: "ADMIN" | "MEMBER" | "GUEST";
}

function countLabel(count: number): string {
    return `${count} ${count === 1 ? "document" : "documents"}`;
}

/**
 * The documents page below the shell: the hero (which owns the "New document"
 * action, so it lives here beside the dialog it opens), search, and the grid.
 */
export function DocumentList({
    documents,
    workspaceId,
    workspaceName,
    userRole,
}: DocumentListProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    const canCreate = userRole === "ADMIN" || userRole === "MEMBER";

    const filteredDocuments = useMemo(() => {
        if (!searchQuery.trim()) {
            return documents;
        }
        const query = searchQuery.toLowerCase().trim();
        return documents.filter((doc) =>
            doc.title.toLowerCase().includes(query),
        );
    }, [documents, searchQuery]);

    const isFiltering = searchQuery.trim().length > 0;

    return (
        <>
            <PageHeader
                eyebrow={`${workspaceName} — Documents`}
                serif="The"
                heavy="Documents"
                description="Anyone here can open the same document and type at the same time. Edits save themselves."
                action={
                    canCreate ? (
                        <PaddockButton
                            size="lg"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus
                                className="size-4"
                                strokeWidth={2.6}
                                aria-hidden="true"
                            />
                            New document
                        </PaddockButton>
                    ) : undefined
                }
            />

            <div className={cn(PAGE_CONTAINER, "flex flex-col gap-8")}>
                {documents.length > 0 ? (
                    <div className="flex flex-wrap items-center justify-between gap-3.5">
                        <label className="relative w-full min-w-0 sm:w-[26.25rem]">
                            <span className="sr-only">Search documents</span>
                            <Search
                                className="pointer-events-none absolute top-1/2 left-4 size-[1.125rem] -translate-y-1/2 text-paddock-subtle"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                placeholder="Search documents"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={cn(
                                    paddockFieldClasses,
                                    "h-13 pl-12",
                                )}
                            />
                        </label>
                        <p
                            className="paddock-mono m-0 text-[0.78125rem] text-paddock-subtle"
                            aria-live="polite"
                        >
                            {isFiltering
                                ? `${filteredDocuments.length} of ${countLabel(documents.length)}`
                                : countLabel(documents.length)}{" "}
                            · sorted by last edited
                        </p>
                    </div>
                ) : null}

                {documents.length === 0 ? (
                    <NotchedCard
                        as="section"
                        className="max-w-[40rem]"
                        bodyClassName="flex flex-col items-start gap-5 px-6 pt-8 pb-14 sm:px-8"
                    >
                        <DisplayHeading
                            as="h2"
                            size="md"
                            serif="No documents"
                            heavy="yet"
                        />
                        <p className="m-0 max-w-[52ch] text-paddock-subtle">
                            Start one and share it with {workspaceName}.
                            Everyone can write in it at the same time.
                        </p>
                        {canCreate ? (
                            <PaddockButton
                                onClick={() => setIsCreateOpen(true)}
                            >
                                <Plus
                                    className="size-4"
                                    strokeWidth={2.6}
                                    aria-hidden="true"
                                />
                                Create first document
                            </PaddockButton>
                        ) : null}
                    </NotchedCard>
                ) : filteredDocuments.length === 0 ? (
                    <p className="m-0 py-8 text-center text-paddock-subtle">
                        No documents found matching &quot;{searchQuery}&quot;
                    </p>
                ) : (
                    <ul className="m-0 grid list-none grid-cols-1 items-start gap-x-[1.125rem] gap-y-6 p-0 md:grid-cols-2 lg:grid-cols-3">
                        {filteredDocuments.map((doc) => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                workspaceId={workspaceId}
                                canManage={canCreate}
                            />
                        ))}
                    </ul>
                )}
            </div>

            <CreateDocumentDialog
                workspaceId={workspaceId}
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </>
    );
}
