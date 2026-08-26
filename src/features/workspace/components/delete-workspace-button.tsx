"use client";

import { useState, useTransition } from "react";
import { deleteWorkspaceAction } from "@/features/workspace/actions/delete-workspace";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function DeleteWorkspaceButton({
    workspaceId,
}: {
    workspaceId: string;
}) {
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
            <Button
                type="button"
                variant="danger"
                onClick={() => setConfirming(true)}
            >
                Delete Workspace
            </Button>
        );
    }

    return (
        <div className="flex flex-col gap-4 max-w-md p-4 border-2 border-brand-danger bg-brand-danger/5 rounded-brand">
            <Alert intent="danger">
                Are you sure? This action is permanent and will delete all
                documents, tasks, and data in this workspace.
            </Alert>
            {error && <Alert intent="danger">{error}</Alert>}
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="danger"
                    onClick={handleDelete}
                    disabled={isPending}
                >
                    {isPending ? "Deleting..." : "Yes, Delete Permanently"}
                </Button>
                <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                        setConfirming(false);
                        setError(null);
                    }}
                    disabled={isPending}
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
