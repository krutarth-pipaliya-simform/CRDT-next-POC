"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { removeMemberAction } from "@/features/workspace/actions/remove-member";
import { Alert } from "@/components/ui/alert";

interface RemoveMemberButtonProps {
    workspaceId: string;
    memberId: string;
    memberName: string;
}

export function RemoveMemberButton({
    workspaceId,
    memberId,
    memberName,
}: RemoveMemberButtonProps) {
    const [open, setOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleRemove = () => {
        setError(null);
        startTransition(async () => {
            const result = await removeMemberAction(workspaceId, memberId);
            if (result.error) {
                setError(result.error);
            } else {
                setOpen(false);
            }
        });
    };

    return (
        <>
            <Button
                variant="ghost"
                size="sm"
                className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger font-brand-mono text-xs"
                onClick={() => {
                    setError(null);
                    setOpen(true);
                }}
                aria-label={`Remove ${memberName}`}
            >
                Remove
            </Button>

            {open && (
                <Dialog
                    open={open}
                    onClose={() => {
                        if (!isPending) {
                            setOpen(false);
                            setError(null);
                        }
                    }}
                    title="Remove Member"
                >
                    <div className="flex flex-col gap-5">
                        <p className="text-sm text-brand-subtle">
                            Are you sure you want to remove{" "}
                            <span className="font-semibold text-brand-ink">
                                {memberName}
                            </span>{" "}
                            from this workspace? They will immediately lose
                            access to all documents, tasks, and data.
                        </p>

                        {error && <Alert intent="danger">{error}</Alert>}

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="secondary"
                                onClick={() => {
                                    setOpen(false);
                                    setError(null);
                                }}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                onClick={handleRemove}
                                disabled={isPending}
                            >
                                {isPending ? "Removing..." : "Confirm Remove"}
                            </Button>
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
}
