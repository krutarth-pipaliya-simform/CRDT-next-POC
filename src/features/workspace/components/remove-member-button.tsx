"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
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
    const [confirming, setConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const handleRemove = () => {
        setError(null);
        startTransition(async () => {
            const result = await removeMemberAction(workspaceId, memberId);
            if (result.error) {
                setError(result.error);
                setConfirming(false);
            }
        });
    };

    if (confirming) {
        return (
            <div className="flex items-center gap-2">
                <Button
                    variant="danger"
                    size="sm"
                    onClick={handleRemove}
                    disabled={isPending}
                >
                    {isPending ? "Removing..." : `Confirm Remove`}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirming(false)}
                    disabled={isPending}
                >
                    Cancel
                </Button>
                {error && <Alert intent="danger">{error}</Alert>}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Button
                variant="ghost"
                size="sm"
                className="text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger font-brand-mono text-xs"
                onClick={() => setConfirming(true)}
                aria-label={`Remove ${memberName}`}
            >
                Remove
            </Button>
            {error && <Alert intent="danger">{error}</Alert>}
        </div>
    );
}
