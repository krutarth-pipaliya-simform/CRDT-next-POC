"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { requestToJoinWorkspaceAction } from "@/features/workspace/actions/request-to-join";
import { JoinRequestStatus } from "@/schemas/workspace";

interface JoinRequestButtonProps {
    workspaceId: string;
    isMember: boolean;
    initialStatus?: JoinRequestStatus | null;
}

export function JoinRequestButton({
    workspaceId,
    isMember,
    initialStatus,
}: JoinRequestButtonProps) {
    const [status, setStatus] = useState<JoinRequestStatus | null>(
        initialStatus || null,
    );
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (isMember) {
        return <Badge intent="default">Member</Badge>;
    }

    if (status === "PENDING") {
        return (
            <Badge
                intent="muted"
                className="border-brand-accent text-brand-accent"
            >
                Request Pending
            </Badge>
        );
    }

    if (status === "APPROVED") {
        return <Badge intent="success">Approved</Badge>;
    }

    const handleRequest = () => {
        setError(null);
        startTransition(async () => {
            const res = await requestToJoinWorkspaceAction(workspaceId);
            if (res.success) {
                setStatus("PENDING");
            } else if (res.error) {
                setError(res.error);
            }
        });
    };

    return (
        <div className="flex flex-col items-end gap-1">
            <Button
                variant="secondary"
                size="sm"
                onClick={handleRequest}
                disabled={isPending}
            >
                {isPending ? "Sending..." : "Request to Join"}
            </Button>
            {error && (
                <span className="text-[10px] font-brand-mono text-brand-danger">
                    {error}
                </span>
            )}
        </div>
    );
}
