"use client";

import { useState, useTransition } from "react";
import { FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { deleteDocumentAction } from "../actions/delete-document";
import type { DocumentItem } from "../types";

export interface DocumentCardProps {
    document: DocumentItem;
    workspaceId: string;
    canManage: boolean;
}

export function DocumentCard({
    document,
    workspaceId,
    canManage,
}: DocumentCardProps) {
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const formattedDate = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
    }).format(new Date(document.updatedAt));

    const handleDelete = () => {
        setDeleteError(null);
        startTransition(async () => {
            const result = await deleteDocumentAction({
                id: document.id,
                workspaceId,
            });

            if (result.success) {
                setIsDeleteDialogOpen(false);
                router.refresh();
            } else {
                setDeleteError(result.error);
            }
        });
    };

    return (
        <>
            <Card className="flex flex-col justify-between p-5 hover:border-brand-accent transition-all duration-150 group">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                        <div className="p-2.5 bg-brand-muted border-2 border-brand-ink rounded-brand text-brand-ink group-hover:bg-brand-accent group-hover:text-white transition-colors">
                            <FileText className="w-5 h-5" aria-hidden="true" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <Link
                                href={`/${workspaceId}/documents/${document.id}`}
                                className="font-bold text-base text-brand-ink hover:text-brand-accent transition-colors truncate focus-visible:outline-2 focus-visible:outline-brand-ink"
                            >
                                {document.title}
                            </Link>
                            <span className="text-xs font-brand-mono text-brand-subtle mt-0.5">
                                Updated {formattedDate}
                            </span>
                        </div>
                    </div>

                    {canManage && (
                        <button
                            type="button"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="p-1.5 text-brand-subtle hover:text-brand-danger hover:bg-brand-danger/10 border border-transparent hover:border-brand-danger rounded-brand transition-colors"
                            title="Delete Document"
                            aria-label={`Delete ${document.title}`}
                        >
                            <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-brand-border">
                    <span className="text-[10px] font-brand-mono uppercase tracking-wider text-brand-subtle">
                        CRDT Real-Time Sync
                    </span>
                    <Link
                        href={`/${workspaceId}/documents/${document.id}`}
                        className="px-3 py-1 text-xs font-bold font-brand-mono uppercase tracking-wider text-brand-ink bg-brand-muted hover:bg-brand-ink hover:text-brand-surface border border-brand-ink rounded-brand transition-all duration-150 shadow-brand-subtle hover:shadow-none"
                    >
                        Open Editor →
                    </Link>
                </div>
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete Document"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-brand-subtle">
                        Are you sure you want to permanently delete{" "}
                        <strong className="text-brand-ink">
                            {document.title}
                        </strong>
                        ? This action cannot be undone.
                    </p>

                    {deleteError && (
                        <div
                            role="alert"
                            className="p-3 bg-brand-danger/10 border border-brand-danger text-brand-danger text-xs font-brand-mono rounded-brand"
                        >
                            {deleteError}
                        </div>
                    )}

                    <div className="flex justify-end gap-3 mt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? "Deleting..." : "Delete Document"}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
