"use client";

import { useState, useTransition } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
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
        <div className="flex w-full flex-col gap-3">
            {error && (
                <p
                    role="alert"
                    className="m-0 rounded-paddock bg-paddock-danger px-3.5 py-3 text-sm font-semibold text-paddock-on-danger"
                >
                    {error}
                </p>
            )}
            <PaddockButton
                onClick={handleJoin}
                disabled={isPending}
                className="w-full"
            >
                {isPending ? "Joining Workspace..." : "Accept Invitation"}
            </PaddockButton>
        </div>
    );
}
