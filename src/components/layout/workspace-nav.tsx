"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { AvatarStack } from "@/components/paddock/paddock-avatar";
import { Tag } from "@/components/paddock/tag";
import { WorkspaceTabs } from "@/components/paddock/workspace-tabs";
import { WORKSPACE_ROLE_LABELS, type WorkspaceRole } from "@/schemas/workspace";

import { PAGE_CONTAINER } from "./layout-styles";
import { isSectionCurrent, workspaceSections } from "./workspace-sections";

export interface WorkspaceNavMember {
    id: string;
    name: string;
    image: string | null;
}

export interface WorkspaceNavProps {
    workspaceId: string;
    userRole: WorkspaceRole;
    /** Everyone with access, so their colours are learnable from any screen. */
    members?: WorkspaceNavMember[];
}

/**
 * The workspace's section tabs, with the team on the right. The workspace's
 * own name and the switcher live in the header above, so this bar is only
 * "where am I in this workspace" and "who is in it".
 */
export function WorkspaceNav({
    workspaceId,
    userRole,
    members = [],
}: WorkspaceNavProps) {
    const pathname = usePathname();

    const items = workspaceSections(workspaceId, userRole).map((section) => ({
        label: section.label,
        href: section.href,
        current: isSectionCurrent(pathname, section),
    }));

    const roleTag = (
        <span data-testid="workspace-role">
            <Tag>{WORKSPACE_ROLE_LABELS[userRole]}</Tag>
        </span>
    );

    return (
        <div className="border-b border-paddock-rule">
            <div
                className={`${PAGE_CONTAINER} flex flex-wrap items-center justify-between gap-x-6 gap-y-2`}
            >
                <WorkspaceTabs items={items} label="Workspace sections" />
                {members.length > 0 ? (
                    <Link
                        href={`/${workspaceId}/settings/members`}
                        className="flex items-center gap-2.5 py-2 no-underline"
                        title={`${members.length} ${members.length === 1 ? "person has" : "people have"} access`}
                    >
                        <AvatarStack people={members} max={6} />
                        {roleTag}
                    </Link>
                ) : (
                    <span className="py-2">{roleTag}</span>
                )}
            </div>
        </div>
    );
}
