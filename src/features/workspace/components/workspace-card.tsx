import Link from "next/link";

import { NotchedCard } from "@/components/paddock/notched-card";
import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { RolePill } from "@/components/paddock/paddock-pills";
import { paddockPresenceVar } from "@/components/paddock/paddock-presence";
import { paddockPillBase } from "@/components/paddock/paddock-styles";
import { JoinPublicButton } from "@/features/workspace/components/join-public-button";
import { LeaveWorkspaceButton } from "@/features/workspace/components/leave-workspace-button";
import { cn } from "@/lib/cn";
import { toWorkspaceRole } from "@/schemas/workspace";

export interface WorkspaceCardMember {
    role: string;
    userId: string;
    user?: { name: string | null; email: string | null; image: string | null };
}

export interface WorkspaceCardItem {
    id: string;
    name: string;
    /** `PUBLIC` or `PRIVATE`; optional so older callers still type-check. */
    visibility?: string;
    _count: { members: number };
    members: WorkspaceCardMember[];
}

export interface WorkspaceCardProps {
    workspace: WorkspaceCardItem;
    currentUserId: string;
    mode?: "my" | "public";
}

export interface SplitDisplayName {
    serif: string;
    heavy: string;
}

/**
 * Splits a name across Paddock's two voices: the first word in the serif,
 * the rest in the heavy caps. A one-word name is set in the heavy alone.
 */
export function splitDisplayName(name: string): SplitDisplayName {
    const trimmed = name.trim();
    const gap = trimmed.search(/\s/);
    if (gap === -1) return { serif: "", heavy: trimmed };
    return {
        serif: trimmed.slice(0, gap),
        heavy: trimmed.slice(gap + 1).trim(),
    };
}

/** How many people the rail is split between before it stops reading as faces. */
const RAIL_SEGMENTS = 8;

export function WorkspaceCard({
    workspace,
    currentUserId,
    mode = "my",
}: WorkspaceCardProps) {
    const memberRecord = workspace.members.find(
        (member) => member.userId === currentUserId,
    );
    const isMember = Boolean(memberRecord);
    const myRole = toWorkspaceRole(memberRecord?.role ?? "MEMBER");
    const memberCount = workspace._count.members;
    const href = `/${workspace.id}`;
    const { serif, heavy } = splitDisplayName(workspace.name);

    // Discovery cards carry ids only, so they show the rail but no faces.
    const people = workspace.members.flatMap((member) =>
        member.user
            ? [
                  {
                      id: member.userId,
                      name: member.user.name || member.user.email || "Member",
                      image: member.user.image,
                  },
              ]
            : [],
    );

    const peopleLabel =
        memberCount === 1 && isMember
            ? "Just you"
            : `${memberCount} ${memberCount === 1 ? "person" : "people"}`;

    const tab =
        mode === "public"
            ? isMember
                ? "You are a member"
                : undefined
            : workspace.visibility === "PUBLIC"
              ? "Public"
              : workspace.visibility === "PRIVATE"
                ? "Private"
                : undefined;

    return (
        <NotchedCard
            as="li"
            tab={tab}
            className="paddock-lift"
            bodyClassName="flex flex-col p-0 pb-7"
        >
            {/* Everyone in this workspace, in their own colours — the same hues
                they will wear on every card and message inside it. */}
            <div aria-hidden="true" className="flex h-1 shrink-0">
                {workspace.members.slice(0, RAIL_SEGMENTS).map((member) => (
                    <span
                        key={member.userId}
                        className="flex-1"
                        style={{
                            backgroundColor: paddockPresenceVar(member.userId),
                        }}
                    />
                ))}
            </div>

            <div className="flex flex-1 flex-col gap-4.5 px-5.5 pt-5.5 pb-4.5">
                <div className="flex items-start justify-between gap-3">
                    <h2 className="m-0 min-w-0 leading-[0.88] break-words">
                        <Link
                            href={href}
                            className="text-paddock-ink no-underline hover:underline hover:decoration-2 hover:underline-offset-4"
                        >
                            {serif ? (
                                <>
                                    <span className="paddock-serif block text-[1.875rem]">
                                        {serif}
                                    </span>{" "}
                                </>
                            ) : null}
                            <span className="paddock-heavy block text-[1.625rem]">
                                {heavy}
                            </span>
                        </Link>
                    </h2>
                    {mode === "public" && !isMember ? (
                        <span
                            className={cn(
                                paddockPillBase,
                                "shrink-0 border-[1.5px] border-paddock-inverse bg-paddock-inverse py-1.5 text-paddock-on-inverse",
                            )}
                        >
                            Public
                        </span>
                    ) : myRole ? (
                        <RolePill role={myRole} className="shrink-0" />
                    ) : null}
                </div>

                <div className="flex min-w-0 items-center gap-3">
                    {people.length > 0 ? (
                        <AvatarStack people={people} size="md" ring="sheet" />
                    ) : null}
                    <span className="truncate text-[0.84375rem] text-paddock-subtle">
                        {peopleLabel}
                    </span>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2">
                    {mode === "public" ? (
                        <>
                            <PaddockLinkButton
                                href={href}
                                variant="outline"
                                voice="plain"
                                size="sm"
                            >
                                {isMember ? "Open workspace" : "View as guest"}
                            </PaddockLinkButton>
                            {!isMember && (
                                <JoinPublicButton
                                    workspaceId={workspace.id}
                                    isMember={false}
                                />
                            )}
                        </>
                    ) : (
                        <>
                            <PaddockLinkButton
                                href={href}
                                size="sm"
                                aria-label={`Open workspace ${workspace.name}`}
                                className="bg-paddock-inverse text-paddock-on-inverse"
                            >
                                Open workspace
                            </PaddockLinkButton>
                            <LeaveWorkspaceButton
                                workspaceId={workspace.id}
                                workspaceName={workspace.name}
                                userRole={memberRecord?.role ?? "MEMBER"}
                                currentUserId={currentUserId}
                                variant="ghost"
                                size="sm"
                            >
                                Leave
                            </LeaveWorkspaceButton>
                        </>
                    )}
                </div>
            </div>
        </NotchedCard>
    );
}
