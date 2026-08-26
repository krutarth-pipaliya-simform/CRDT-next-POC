"use client";

import { useState, useTransition } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { joinWorkspaceAction } from "@/features/workspace/actions/join-workspace";

export interface JoinWorkspaceButtonProps {
    token: string;
}

export function JoinWorkspaceButton({ token }: JoinWorkspaceButtonProps) {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    const handleJoin = () => {
        setError(null);
        startTransition(async () => {
            const result = await joinWorkspaceAction(token);
            if (result?.error) {
                setError(result.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-3 w-full">
            {error && <Alert intent="danger">{error}</Alert>}
            <Button
                type="button"
                onClick={handleJoin}
                disabled={isPending}
                withArrow
                className="w-full justify-between"
            >
                {isPending ? "Joining Workspace..." : "Accept Invitation"}
            </Button>
        </div>
    );
}
