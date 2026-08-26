"use client";

import { useCallback, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { getTransferCandidatesAction } from "@/features/workspace/actions/get-transfer-candidates";
import { leaveWorkspaceAction } from "@/features/workspace/actions/leave-workspace";
import { cn } from "@/lib/cn";

export interface WorkspaceMemberInfo {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image?: string | null;
    };
}

export interface LeaveWorkspaceButtonProps {
    workspaceId: string;
    workspaceName?: string;
    userRole?: "ADMIN" | "MEMBER" | "GUEST" | string;
    currentUserId?: string;
    members?: WorkspaceMemberInfo[];
    variant?: "primary" | "secondary" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    className?: string;
    children?: ReactNode;
    redirectOnLeave?: boolean;
}

export function LeaveWorkspaceButton({
    workspaceId,
    workspaceName = "this workspace",
    userRole = "MEMBER",
    currentUserId,
    members,
    variant = "ghost",
    size = "sm",
    className,
    children,
    redirectOnLeave = true,
}: LeaveWorkspaceButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [selectedMemberId, setSelectedMemberId] = useState<string>("");
    const [isLoadingCandidates, setIsLoadingCandidates] = useState(false);
    const [candidates, setCandidates] = useState<WorkspaceMemberInfo[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();

    const isAdmin = userRole === "ADMIN";

    const loadCandidates = useCallback(async () => {
        if (!isAdmin) return;

        if (members && members.length > 0 && currentUserId) {
            const filtered = members.filter(
                (m) => m.user.id !== currentUserId && m.id !== currentUserId,
            );
            setCandidates(filtered);
            if (filtered.length > 0) {
                setSelectedMemberId(filtered[0].id);
            }
            return;
        }

        setIsLoadingCandidates(true);
        setError(null);
        try {
            const res = await getTransferCandidatesAction(workspaceId);
            if (res.success && res.data) {
                setCandidates(res.data);
                if (res.data.length > 0) {
                    setSelectedMemberId(res.data[0].id);
                }
            } else if (res.error) {
                setError(res.error);
            }
        } catch {
            setError("Failed to load workspace members");
        } finally {
            setIsLoadingCandidates(false);
        }
    }, [isAdmin, members, currentUserId, workspaceId]);

    const handleOpen = () => {
        setError(null);
        setOpen(true);
        if (isAdmin) {
            loadCandidates();
        }
    };

    const handleLeave = () => {
        setError(null);

        if (isAdmin && candidates.length > 0 && !selectedMemberId) {
            setError(
                "Please select an eligible member to appoint as the new admin.",
            );
            return;
        }

        startTransition(async () => {
            const targetTransferId = isAdmin ? selectedMemberId : undefined;
            const res = await leaveWorkspaceAction(
                workspaceId,
                targetTransferId,
            );

            if (res.error) {
                setError(res.error);
            } else {
                setOpen(false);
                if (redirectOnLeave) {
                    router.push("/dashboard");
                    router.refresh();
                }
            }
        });
    };

    return (
        <>
            <Button
                type="button"
                variant={variant}
                size={size}
                className={cn(
                    variant === "ghost" &&
                        "text-brand-danger hover:bg-brand-danger/10 hover:text-brand-danger font-brand-mono text-xs cursor-pointer",
                    className,
                )}
                onClick={handleOpen}
                aria-label={`Leave ${workspaceName}`}
            >
                {children || "Leave Workspace"}
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
                    title={
                        isAdmin && candidates.length > 0
                            ? "Transfer Ownership & Leave"
                            : "Leave Workspace"
                    }
                >
                    <div className="flex flex-col gap-5">
                        {/* Member case: Standard confirmation */}
                        {!isAdmin && (
                            <p className="text-sm text-brand-subtle leading-relaxed">
                                Are you sure you want to leave{" "}
                                <span className="font-semibold text-brand-ink">
                                    {workspaceName}
                                </span>
                                ? You will immediately lose access to all
                                documents, tasks, and data in this workspace.
                            </p>
                        )}

                        {/* Admin case: Sole member */}
                        {isAdmin &&
                            !isLoadingCandidates &&
                            candidates.length === 0 && (
                                <div className="flex flex-col gap-3">
                                    <Alert intent="warning">
                                        Cannot Leave Workspace
                                    </Alert>
                                    <p className="text-sm text-brand-subtle leading-relaxed">
                                        You are currently the{" "}
                                        <span className="font-semibold text-brand-ink">
                                            only member
                                        </span>{" "}
                                        in this workspace. Workspace admins
                                        cannot leave without first appointing
                                        another member as admin.
                                    </p>
                                    <p className="text-xs font-brand-mono text-brand-subtle">
                                        To remove this workspace, you can delete
                                        it permanently from Workspace Settings,
                                        or invite another team member before
                                        leaving.
                                    </p>
                                </div>
                            )}

                        {/* Admin case: Transfer ownership to another member */}
                        {isAdmin &&
                            !isLoadingCandidates &&
                            candidates.length > 0 && (
                                <div className="flex flex-col gap-4">
                                    <p className="text-sm text-brand-subtle leading-relaxed">
                                        As the workspace admin, you must
                                        transfer ownership by appointing another
                                        member as the new admin before leaving.
                                    </p>

                                    <div className="flex flex-col gap-2">
                                        <label
                                            htmlFor="new-admin-select"
                                            className="font-brand-mono text-xs uppercase tracking-wider text-brand-ink font-semibold"
                                        >
                                            Select New Workspace Admin
                                        </label>
                                        <div className="flex flex-col gap-2 max-h-52 overflow-y-auto border-2 border-brand-border rounded-brand p-1 bg-brand-surface">
                                            {candidates.map((candidate) => {
                                                const isSelected =
                                                    selectedMemberId ===
                                                    candidate.id;
                                                return (
                                                    <button
                                                        type="button"
                                                        key={candidate.id}
                                                        onClick={() =>
                                                            setSelectedMemberId(
                                                                candidate.id,
                                                            )
                                                        }
                                                        className={cn(
                                                            "flex items-center justify-between p-2.5 rounded-brand text-left transition-colors border cursor-pointer",
                                                            isSelected
                                                                ? "border-brand-accent bg-brand-muted/70 font-semibold"
                                                                : "border-transparent hover:bg-brand-muted/40",
                                                        )}
                                                        aria-pressed={
                                                            isSelected
                                                        }
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <div className="w-7 h-7 rounded-full bg-brand-ink text-brand-surface font-brand-mono text-xs font-semibold flex items-center justify-center uppercase shrink-0">
                                                                {candidate.user
                                                                    .name?.[0] ||
                                                                    candidate
                                                                        .user
                                                                        .email?.[0] ||
                                                                    "U"}
                                                            </div>
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs text-brand-ink truncate font-medium">
                                                                    {candidate
                                                                        .user
                                                                        .name ||
                                                                        "Unnamed Member"}
                                                                </span>
                                                                <span className="text-[11px] font-brand-mono text-brand-subtle truncate">
                                                                    {
                                                                        candidate
                                                                            .user
                                                                            .email
                                                                    }
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            <Badge intent="muted">
                                                                {candidate.role}
                                                            </Badge>
                                                            {isSelected && (
                                                                <span className="text-brand-accent text-xs font-brand-mono font-bold">
                                                                    ✓
                                                                </span>
                                                            )}
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <p className="text-xs font-brand-mono text-brand-subtle bg-brand-muted/30 p-2.5 border border-brand-border rounded-brand">
                                        Once confirmed, the selected member will
                                        receive Admin privileges, and your
                                        membership will be removed immediately.
                                    </p>
                                </div>
                            )}

                        {/* Loading candidates state */}
                        {isAdmin && isLoadingCandidates && (
                            <div className="py-6 text-center font-brand-mono text-xs text-brand-subtle animate-pulse">
                                Loading eligible workspace members...
                            </div>
                        )}

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
                                {isAdmin &&
                                !isLoadingCandidates &&
                                candidates.length === 0
                                    ? "Close"
                                    : "Cancel"}
                            </Button>

                            {/* Only show leave action if not sole admin member */}
                            {(!isAdmin ||
                                (isAdmin && candidates.length > 0)) && (
                                <Button
                                    type="button"
                                    variant="danger"
                                    onClick={handleLeave}
                                    disabled={
                                        isPending ||
                                        (isAdmin &&
                                            (!selectedMemberId ||
                                                isLoadingCandidates))
                                    }
                                >
                                    {isPending
                                        ? isAdmin
                                            ? "Transferring & Leaving..."
                                            : "Leaving..."
                                        : isAdmin
                                          ? "Transfer & Leave"
                                          : "Leave Workspace"}
                                </Button>
                            )}
                        </div>
                    </div>
                </Dialog>
            )}
        </>
    );
}
