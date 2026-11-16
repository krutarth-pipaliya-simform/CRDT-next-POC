"use client";

import { useState, useTransition } from "react";

import {
    PaddockButton,
    PaddockLinkButton,
} from "@/components/paddock/paddock-button";
import { joinPublicWorkspaceAction } from "@/features/workspace/actions/join-public-workspace";

export interface JoinPublicButtonProps {
    workspaceId: string;
    isMember: boolean;
}

export function JoinPublicButton({
    workspaceId,
    isMember: initialIsMember,
}: JoinPublicButtonProps) {
    const [isMember, setIsMember] = useState(initialIsMember);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (isMember) {
        return (
            <PaddockLinkButton
                href={`/${workspaceId}`}
                size="sm"
                className="bg-paddock-inverse text-paddock-on-inverse"
            >
                Open workspace
            </PaddockLinkButton>
        );
    }

    const handleJoin = () => {
        setError(null);
        startTransition(async () => {
            const res = await joinPublicWorkspaceAction(workspaceId);
            if (res.success) {
                setIsMember(true);
            } else if (res.error) {
                setError(res.error);
            }
        });
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <PaddockButton size="sm" onClick={handleJoin} disabled={isPending}>
                {isPending ? "Joining..." : "Join Workspace"}
            </PaddockButton>
            {error && (
                <span
                    role="alert"
                    className="text-[0.8125rem] font-semibold text-paddock-danger"
                >
                    {error}
                </span>
            )}
        </div>
    );
}
