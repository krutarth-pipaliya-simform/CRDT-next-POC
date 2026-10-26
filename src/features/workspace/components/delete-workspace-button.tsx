"use client";

import { useState, useTransition } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { deleteWorkspaceAction } from "@/features/workspace/actions/delete-workspace";

export interface DeleteWorkspaceButtonProps {
    workspaceId: string;
}

/**
 * Two steps, in place: the trigger, then a confirmation that asks again. The
 * confirmation spans the full row (`basis-full`), so render this inside a
 * wrapping flex row next to the action's description.
 */
export function DeleteWorkspaceButton({
    workspaceId,
}: DeleteWorkspaceButtonProps) {
    const [confirming, setConfirming] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleDelete = () => {
        setError(null);
        startTransition(async () => {
            const result = await deleteWorkspaceAction(workspaceId);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    if (!confirming) {
        return (
            <PaddockButton
                variant="outline"
                voice="plain"
                size="sm"
                className="border-paddock-danger text-paddock-danger"
                onClick={() => setConfirming(true)}
            >
                Delete workspace
            </PaddockButton>
        );
    }

    return (
        <div
            role="alert"
            className="paddock-in flex basis-full flex-col gap-3.5 rounded-paddock bg-[color-mix(in_srgb,var(--color-paddock-danger)_9%,var(--color-paddock-paper))] px-5 py-4.5"
        >
            <p className="m-0 font-semibold">
                Are you sure? This action is permanent and will delete all
                documents, tasks, and data in this workspace.
            </p>
            {error ? (
                <p className="m-0 text-sm font-semibold text-paddock-danger">
                    {error}
                </p>
            ) : null}
            <div className="flex flex-wrap gap-2.5">
                <PaddockButton
                    variant="danger"
                    voice="plain"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    {isPending ? "Deleting..." : "Yes, delete permanently"}
                </PaddockButton>
                <PaddockButton
                    variant="outline"
                    voice="plain"
                    size="sm"
                    onClick={() => {
                        setConfirming(false);
                        setError(null);
                    }}
                    disabled={isPending}
                >
                    Cancel
                </PaddockButton>
            </div>
        </div>
    );
}
