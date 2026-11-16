"use client";

import {
    useCallback,
    useId,
    useState,
    useTransition,
    type ReactNode,
} from "react";
import { Check, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import { RolePill } from "@/components/paddock/paddock-pills";
import type {
    PaddockButtonSize,
    PaddockButtonVariant,
} from "@/components/paddock/paddock-styles";
import { getTransferCandidatesAction } from "@/features/workspace/actions/get-transfer-candidates";
import { leaveWorkspaceAction } from "@/features/workspace/actions/leave-workspace";
import { cn } from "@/lib/cn";
import { toWorkspaceRole } from "@/schemas/workspace";

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

export type LeaveWorkspaceButtonVariant =
    "primary" | "secondary" | "ghost" | "danger";

export interface LeaveWorkspaceButtonProps {
    workspaceId: string;
    workspaceName?: string;
    userRole?: "ADMIN" | "MEMBER" | "GUEST" | string;
    currentUserId?: string;
    members?: WorkspaceMemberInfo[];
    variant?: LeaveWorkspaceButtonVariant;
    size?: PaddockButtonSize;
    className?: string;
    children?: ReactNode;
    redirectOnLeave?: boolean;
}

/** The existing variant names, restated as Paddock button variants. */
const TRIGGER_VARIANT: Record<
    LeaveWorkspaceButtonVariant,
    PaddockButtonVariant
> = {
    primary: "primary",
    secondary: "outline",
    ghost: "ghost",
    danger: "danger",
};

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
    const candidatesLabelId = useId();

    const isAdmin = userRole === "ADMIN";
    const isSoleAdmin =
        isAdmin && !isLoadingCandidates && candidates.length === 0;
    const isTransfer = isAdmin && candidates.length > 0;

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

    const handleClose = () => {
        if (!isPending) {
            setOpen(false);
            setError(null);
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
                }
            }
        });
    };

    const isGhost = variant === "ghost";

    return (
        <>
            <PaddockButton
                variant={TRIGGER_VARIANT[variant]}
                size={size}
                voice={isGhost ? "plain" : undefined}
                className={cn(
                    isGhost && "text-paddock-danger hover:bg-paddock-danger/10",
                    className,
                )}
                onClick={handleOpen}
                aria-label={`Leave ${workspaceName}`}
            >
                {children || "Leave Workspace"}
            </PaddockButton>

            {/* The dialog stays mounted so focus can return to the trigger,
                but its body only renders while open: every card on the
                dashboard has one, and their text must not exist twice. */}
            <PaddockDialog
                open={open}
                onClose={handleClose}
                titleSerif={isTransfer ? "Transfer Ownership" : "Leave"}
                titleHeavy={isTransfer ? "& Leave" : "Workspace"}
                className="w-[35rem]"
                footer={
                    open ? (
                        <>
                            <PaddockButton
                                variant="outline"
                                voice="plain"
                                onClick={() => {
                                    setOpen(false);
                                    setError(null);
                                }}
                                disabled={isPending}
                            >
                                {isSoleAdmin ? "Close" : "Cancel"}
                            </PaddockButton>

                            {/* Only show leave action if not sole admin member */}
                            {(!isAdmin || isTransfer) && (
                                <PaddockButton
                                    variant="danger"
                                    voice="display"
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
                                </PaddockButton>
                            )}
                        </>
                    ) : null
                }
            >
                {open ? (
                    <div className="flex flex-col gap-4.5">
                        {/* Member case: Standard confirmation */}
                        {!isAdmin && (
                            <p className="m-0 text-[0.90625rem] leading-relaxed text-paddock-subtle">
                                Are you sure you want to leave{" "}
                                <span className="font-semibold text-paddock-ink">
                                    {workspaceName}
                                </span>
                                ? You will immediately lose access to all
                                documents, tasks, and data in this workspace.
                            </p>
                        )}

                        {/* Admin case: Sole member */}
                        {isSoleAdmin && (
                            <div className="flex flex-col gap-3">
                                <p
                                    role="alert"
                                    className="m-0 flex items-center gap-2.5 rounded-paddock border-[1.5px] border-paddock-warning px-3.5 py-3 text-sm font-semibold text-paddock-warning"
                                >
                                    <TriangleAlert
                                        aria-hidden="true"
                                        className="size-4 shrink-0"
                                        strokeWidth={2.2}
                                    />
                                    Cannot Leave Workspace
                                </p>
                                <p className="m-0 text-[0.90625rem] leading-relaxed text-paddock-subtle">
                                    You are currently the{" "}
                                    <span className="font-semibold text-paddock-ink">
                                        only member
                                    </span>{" "}
                                    in this workspace. Workspace admins cannot
                                    leave without first appointing another
                                    member as admin.
                                </p>
                                <p className="m-0 text-[0.8125rem] text-paddock-subtle">
                                    To remove this workspace, you can delete it
                                    permanently from Workspace Settings, or
                                    invite another team member before leaving.
                                </p>
                            </div>
                        )}

                        {/* Admin case: Transfer ownership to another member */}
                        {isAdmin &&
                            !isLoadingCandidates &&
                            candidates.length > 0 && (
                                <div className="flex flex-col gap-4">
                                    <p className="m-0 text-[0.90625rem] leading-relaxed text-paddock-subtle">
                                        As the workspace admin, you must
                                        transfer ownership by appointing another
                                        member as the new admin before leaving.
                                    </p>

                                    <div
                                        role="group"
                                        aria-labelledby={candidatesLabelId}
                                        className="flex flex-col gap-2"
                                    >
                                        <p
                                            id={candidatesLabelId}
                                            className="m-0 mb-1 text-sm font-semibold text-paddock-ink"
                                        >
                                            Select New Workspace Admin
                                        </p>
                                        <div className="flex max-h-60 flex-col gap-2 overflow-y-auto overscroll-contain p-0.5">
                                            {candidates.map((candidate) => {
                                                const isSelected =
                                                    selectedMemberId ===
                                                    candidate.id;
                                                const role = toWorkspaceRole(
                                                    candidate.role,
                                                );
                                                const name =
                                                    candidate.user.name ||
                                                    "Unnamed Member";
                                                return (
                                                    <button
                                                        type="button"
                                                        key={candidate.id}
                                                        onClick={() =>
                                                            setSelectedMemberId(
                                                                candidate.id,
                                                            )
                                                        }
                                                        aria-pressed={
                                                            isSelected
                                                        }
                                                        className={cn(
                                                            "flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-paddock border-[1.5px] px-3 py-2.5 text-left text-paddock-ink",
                                                            isSelected
                                                                ? "border-paddock-ink bg-paddock-sheet"
                                                                : "border-paddock-rule bg-transparent hover:bg-paddock-ink/5",
                                                        )}
                                                    >
                                                        <PaddockAvatar
                                                            person={{
                                                                id: candidate
                                                                    .user.id,
                                                                name:
                                                                    candidate
                                                                        .user
                                                                        .name ||
                                                                    candidate
                                                                        .user
                                                                        .email ||
                                                                    "Member",
                                                                image: candidate
                                                                    .user.image,
                                                            }}
                                                            size="md"
                                                            decorative
                                                        />
                                                        <span className="flex min-w-0 flex-1 flex-col">
                                                            <span className="truncate text-[0.90625rem] font-semibold">
                                                                {name}
                                                            </span>
                                                            <span className="paddock-mono truncate text-xs text-paddock-subtle">
                                                                {
                                                                    candidate
                                                                        .user
                                                                        .email
                                                                }
                                                            </span>
                                                        </span>
                                                        {role ? (
                                                            <RolePill
                                                                role={role}
                                                                className="shrink-0"
                                                            />
                                                        ) : null}
                                                        <span
                                                            aria-hidden="true"
                                                            className={cn(
                                                                "flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px]",
                                                                isSelected
                                                                    ? "border-paddock-lime bg-paddock-lime text-paddock-on-fill"
                                                                    : "border-paddock-rule text-transparent",
                                                            )}
                                                        >
                                                            <Check
                                                                className="size-3.5"
                                                                strokeWidth={3}
                                                            />
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <p className="m-0 text-[0.8125rem] text-paddock-subtle">
                                        Once confirmed, the selected member will
                                        receive Admin privileges, and your
                                        membership will be removed immediately.
                                    </p>
                                </div>
                            )}

                        {/* Loading candidates state */}
                        {isAdmin && isLoadingCandidates && (
                            <p
                                role="status"
                                className="m-0 py-6 text-center text-sm text-paddock-subtle motion-safe:animate-pulse"
                            >
                                Loading eligible workspace members...
                            </p>
                        )}

                        {error && (
                            <p
                                role="alert"
                                className="m-0 rounded-paddock bg-paddock-danger px-3.5 py-3 text-sm font-semibold text-paddock-on-danger"
                            >
                                {error}
                            </p>
                        )}
                    </div>
                ) : null}
            </PaddockDialog>
        </>
    );
}
