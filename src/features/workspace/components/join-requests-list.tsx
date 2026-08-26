"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleJoinRequestAction } from "@/features/workspace/actions/handle-join-request";
import { Alert } from "@/components/ui/alert";

interface JoinRequestItem {
    id: string;
    status: "PENDING" | "APPROVED" | "REJECTED";
    createdAt: Date;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

interface JoinRequestsListProps {
    workspaceId: string;
    requests: JoinRequestItem[];
}

export function JoinRequestsList({
    workspaceId,
    requests,
}: JoinRequestsListProps) {
    const [requestList, setRequestList] = useState(requests);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    if (requestList.length === 0) {
        return (
            <p className="text-xs font-brand-mono text-brand-subtle">
                No pending join requests for this workspace.
            </p>
        );
    }

    const handleAction = (requestId: string, action: "APPROVE" | "REJECT") => {
        setError(null);
        startTransition(async () => {
            const res = await handleJoinRequestAction(
                workspaceId,
                requestId,
                action,
            );
            if (res.success) {
                setRequestList((prev) =>
                    prev.map((r) =>
                        r.id === requestId
                            ? {
                                  ...r,
                                  status:
                                      action === "APPROVE"
                                          ? "APPROVED"
                                          : "REJECTED",
                              }
                            : r,
                    ),
                );
            } else if (res.error) {
                setError(res.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-3">
            {error && <Alert intent="danger">{error}</Alert>}
            <ul className="flex flex-col divide-y-2 divide-brand-muted border-2 border-brand-border rounded-brand overflow-hidden">
                {requestList.map((req) => (
                    <li
                        key={req.id}
                        className="flex items-center justify-between p-4 bg-brand-surface hover:bg-brand-muted/30 transition-colors"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-ink text-brand-surface font-brand-mono text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                                {req.user.name?.[0] ||
                                    req.user.email?.[0] ||
                                    "U"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-brand-ink">
                                    {req.user.name || "Unnamed User"}
                                </span>
                                <span className="text-xs font-brand-mono text-brand-subtle">
                                    {req.user.email}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            {req.status === "PENDING" ? (
                                <>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        onClick={() =>
                                            handleAction(req.id, "APPROVE")
                                        }
                                        disabled={isPending}
                                        aria-label={`Approve ${req.user.name || req.user.email}`}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="text-brand-danger hover:bg-brand-danger/10"
                                        onClick={() =>
                                            handleAction(req.id, "REJECT")
                                        }
                                        disabled={isPending}
                                        aria-label={`Reject ${req.user.name || req.user.email}`}
                                    >
                                        Reject
                                    </Button>
                                </>
                            ) : (
                                <Badge
                                    intent={
                                        req.status === "APPROVED"
                                            ? "success"
                                            : "danger"
                                    }
                                >
                                    {req.status}
                                </Badge>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
