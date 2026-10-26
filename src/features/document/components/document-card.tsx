"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { NotchedCard } from "@/components/paddock/notched-card";
import {
    PaddockButton,
    PaddockIconButton,
} from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import { formatRelativeTime } from "@/lib/format-time";

import { deleteDocumentAction } from "../actions/delete-document";
import type { DocumentItem } from "../types";

export interface DocumentCardProps {
    document: DocumentItem;
    workspaceId: string;
    canManage: boolean;
}

/** Widths of the faint text lines in the page preview, top to bottom. */
const PREVIEW_LINES = ["w-full", "w-[88%]", "w-[94%]", "w-[70%]", "w-[80%]"];

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
        <li className="paddock-lift min-w-0 list-none lg:nth-[3n]:mt-5 lg:nth-[3n+2]:mt-12">
            <NotchedCard
                bodyClassName="p-0 pb-7"
                tab={
                    <span className="flex items-center gap-2">
                        Edited
                        <time
                            dateTime={updatedAt.toISOString()}
                            title={exactDate}
                            suppressHydrationWarning
                            className="paddock-mono text-[0.71875rem] font-medium normal-case"
                        >
                            {formatRelativeTime(updatedAt)}
                        </time>
                    </span>
                }
            >
                {/* A sketch of a page, so the grid reads as documents at a glance. */}
                <div
                    aria-hidden="true"
                    className="relative h-[8.625rem] overflow-hidden border-b border-paddock-rule bg-paddock-paper"
                >
                    <span className="absolute top-[1.625rem] right-[3.75rem] left-[1.625rem] flex flex-col gap-[0.5625rem]">
                        <span className="h-2.5 w-[62%] rounded-[2px] bg-paddock-ink" />
                        {PREVIEW_LINES.map((width) => (
                            <span
                                key={width}
                                className={`h-1.5 rounded-[2px] bg-paddock-rule ${width}`}
                            />
                        ))}
                    </span>
                </div>

                <div className="flex items-start justify-between gap-3 px-5 pt-[1.125rem] pb-3.5">
                    {/* The whole card is the target; the heading carries the
                        link so the accessible name is the document's title. */}
                    <h3 className="m-0 min-w-0">
                        <Link
                            href={`/${workspaceId}/documents/${document.id}`}
                            className="paddock-heavy block text-[1.375rem] leading-[0.98] break-words text-paddock-ink no-underline after:absolute after:inset-0 after:content-['']"
                        >
                            {document.title}
                        </Link>
                    </h3>

                    {canManage ? (
                        <PaddockIconButton
                            label={`Delete ${document.title}`}
                            icon={
                                <Trash2 className="size-4" strokeWidth={1.8} />
                            }
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsDeleteDialogOpen(true)}
                            className="relative z-10 border-[1.5px] border-paddock-rule text-paddock-subtle hover:text-paddock-danger"
                        />
                    ) : null}
                </div>
            </NotchedCard>

            <PaddockDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                titleSerif="Delete this"
                titleHeavy="document?"
                className="w-[30rem]"
                footer={
                    <>
                        <PaddockButton
                            variant="outline"
                            voice="plain"
                            onClick={() => setIsDeleteDialogOpen(false)}
                        >
                            Cancel
                        </PaddockButton>
                        <PaddockButton
                            variant="danger"
                            voice="display"
                            onClick={handleDelete}
                            disabled={isPending}
                        >
                            {isPending ? "Deleting…" : "Delete document"}
                        </PaddockButton>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <p className="m-0 leading-relaxed">
                        <strong className="font-bold">{document.title}</strong>{" "}
                        and everything in it will be deleted for everyone in
                        this workspace. This cannot be undone.
                    </p>

                    {deleteError ? (
                        <p
                            role="alert"
                            className="m-0 rounded-paddock border-[1.5px] border-paddock-danger px-3.5 py-3 text-[0.8125rem] font-semibold text-paddock-danger"
                        >
                            {deleteError}
                        </p>
                    ) : null}
                </div>
            </PaddockDialog>
        </li>
    );
}
