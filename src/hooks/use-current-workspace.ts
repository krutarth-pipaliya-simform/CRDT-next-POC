"use client";

import { useParams } from "next/navigation";

import type { ShellWorkspace } from "@/components/layout/types";

export interface CurrentWorkspace {
    /** The `[workspaceId]` segment, or `null` outside a workspace. */
    workspaceId: string | null;
    /** The caller's membership of it, or `null` when they are not a member. */
    workspace: ShellWorkspace | null;
}

/**
 * The workspace the current route belongs to, looked up in the caller's own
 * list. The shell renders above the `[workspaceId]` layout, so it reads the
 * segment from the URL rather than from a prop. A public workspace viewed by a
 * non-member has an id but no membership.
 */
export function useCurrentWorkspace(
    workspaces: ShellWorkspace[],
): CurrentWorkspace {
    const params = useParams();
    const workspaceId =
        typeof params.workspaceId === "string" ? params.workspaceId : null;

    return {
        workspaceId,
        workspace: workspaceId
            ? (workspaces.find((workspace) => workspace.id === workspaceId) ??
              null)
            : null,
    };
}
