"use client";

import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import type { DocumentItem } from "../types";
import { CreateDocumentDialog } from "./create-document-dialog";
import { DocumentCard } from "./document-card";

export interface DocumentListProps {
    documents: DocumentItem[];
    workspaceId: string;
    workspaceName: string;
    userRole: "ADMIN" | "MEMBER" | "GUEST";
}

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

    return (
        <div className="flex flex-col gap-6">
            {/* Header Controls: Search & New Document */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search
                        className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-subtle pointer-events-none"
                        aria-hidden="true"
                    />
                    <Input
                        type="search"
                        placeholder="Search workspace documents..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                        aria-label="Search documents"
                    />
                </div>

                {canCreate && (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => setIsCreateOpen(true)}
                    >
                        <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                        New Document
                    </Button>
                )}
            </div>

            {/* Document Grid / Empty State */}
            {documents.length === 0 ? (
                <div className="flex flex-col items-center gap-4 py-8">
                    <EmptyState
                        title="No documents yet"
                        description={`Create collaborative CRDT documents in ${workspaceName} with real-time multiplayer synchronization, rich text blocks, and autosave.`}
                    />
                    {canCreate && (
                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => setIsCreateOpen(true)}
                        >
                            <Plus
                                className="w-4 h-4 mr-1.5"
                                aria-hidden="true"
                            />
                            Create First Document
                        </Button>
                    )}
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="py-8 text-center">
                    <p className="text-brand-subtle text-sm font-brand-mono">
                        No documents found matching &quot;{searchQuery}&quot;
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredDocuments.map((doc) => (
                        <DocumentCard
                            key={doc.id}
                            document={doc}
                            workspaceId={workspaceId}
                            canManage={canCreate}
                        />
                    ))}
                </div>
            )}

            {/* Create Document Dialog */}
            <CreateDocumentDialog
                workspaceId={workspaceId}
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
            />
        </div>
    );
}
