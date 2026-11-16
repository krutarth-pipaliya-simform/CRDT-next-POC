"use client";

import { useState, useTransition } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import { removeMemberAction } from "@/features/workspace/actions/remove-member";

export interface RemoveMemberButtonProps {
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

    const close = () => {
        if (isPending) return;
        setOpen(false);
        setError(null);
    };

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
            <PaddockButton
                variant="outline"
                voice="plain"
                size="sm"
                onClick={() => {
                    setError(null);
                    setOpen(true);
                }}
                aria-label={`Remove ${memberName}`}
            >
                Remove
            </PaddockButton>

            {/* Stays mounted so focus can return to the trigger on close. */}
            <PaddockDialog
                open={open}
                onClose={close}
                titleSerif="Remove"
                titleHeavy="member"
                className="w-[30rem]"
                footer={
                    <>
                        <PaddockButton
                            variant="outline"
                            voice="plain"
                            onClick={close}
                            disabled={isPending}
                        >
                            Cancel
                        </PaddockButton>
                        <PaddockButton
                            variant="danger"
                            voice="plain"
                            onClick={handleRemove}
                            disabled={isPending}
                        >
                            {isPending ? "Removing..." : "Remove member"}
                        </PaddockButton>
                    </>
                }
            >
                <div className="flex flex-col gap-4">
                    <p className="m-0 text-base">
                        Remove <strong>{memberName}</strong> from this
                        workspace? They lose access to every document, task and
                        message straight away.
                    </p>
                    {error ? (
                        <p
                            role="alert"
                            className="m-0 text-sm font-semibold text-paddock-danger"
                        >
                            {error}
                        </p>
                    ) : null}
                </div>
            </PaddockDialog>
        </>
    );
}
