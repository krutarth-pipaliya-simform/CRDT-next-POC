"use client";

import { useState, useTransition } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
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
            <Link
                href={`/${workspaceId}`}
                className="font-brand-mono text-xs text-brand-accent uppercase tracking-widest hover:underline"
            >
                Open Workspace →
            </Link>
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
            <Button
                variant="primary"
                size="sm"
                onClick={handleJoin}
                disabled={isPending}
            >
                {isPending ? "Joining..." : "Join Workspace"}
            </Button>
            {error && (
                <span className="text-[10px] font-brand-mono text-brand-danger">
                    {error}
                </span>
            )}
        </div>
    );
}
