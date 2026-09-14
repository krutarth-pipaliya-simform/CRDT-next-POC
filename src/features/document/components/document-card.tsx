"use client";

import { useState, useTransition } from "react";
import { FileText, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { formatRelativeTime } from "@/lib/format-time";

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

    const updatedAt = new Date(document.updatedAt);
    const exactDate = new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(updatedAt);

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
            <Card
                interactive
                className="relative flex items-start gap-3 p-4 min-w-0 w-full overflow-hidden"
            >
                <span className="p-2 bg-brand-muted rounded-brand text-brand-subtle shrink-0">
                    <FileText className="w-4 h-4" aria-hidden="true" />
                </span>

                <div className="flex flex-col min-w-0 flex-1">
                    {/* The whole card is the target; the heading carries the
                        link so the accessible name is the document's title. */}
                    <h3 className="min-w-0">
                        <Link
                            href={`/${workspaceId}/documents/${document.id}`}
                            className="font-semibold text-[15px] text-brand-ink truncate block after:absolute after:inset-0 after:content-['']"
                        >
                            {document.title}
                        </Link>
                    </h3>
                    <time
                        dateTime={updatedAt.toISOString()}
                        title={exactDate}
                        suppressHydrationWarning
                        className="text-[13px] text-brand-subtle mt-0.5"
                    >
                        Edited {formatRelativeTime(updatedAt)}
                    </time>
                </div>

                {canManage && (
                    <button
                        type="button"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="relative z-10 p-1.5 -m-1 text-brand-subtle hover:text-brand-danger rounded-brand transition-colors shrink-0"
                        aria-label={`Delete ${document.title}`}
                    >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                )}
            </Card>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                title="Delete this document?"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-sm text-brand-subtle leading-relaxed">
                        <strong className="text-brand-ink font-semibold">
                            {document.title}
                        </strong>{" "}
                        and everything in it will be deleted for everyone in
                        this workspace. This cannot be undone.
                    </p>

                    {deleteError && (
                        <div
                            role="alert"
                            className="p-3 bg-brand-danger/10 border border-brand-danger/40 text-brand-danger text-[13px] rounded-brand"
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
                            {isPending ? "Deleting…" : "Delete document"}
                        </Button>
                    </div>
                </div>
            </Dialog>
        </>
    );
}
