import type { WorkspaceRole } from "@/schemas/workspace";

/**
 * The sections of a workspace, in order. One list feeds both the tab bar and
 * the menu overlay, so the two can never disagree. No `"use client"`, so a
 * server component can import it too.
 */

export interface WorkspaceSection {
    label: string;
    href: string;
    /** Match the path exactly rather than as a prefix (the overview). */
    exact?: boolean;
}

export function workspaceSections(
    workspaceId: string,
    role: WorkspaceRole | null,
): WorkspaceSection[] {
    return [
        { label: "Overview", href: `/${workspaceId}`, exact: true },
        { label: "Documents", href: `/${workspaceId}/documents` },
        { label: "Tasks", href: `/${workspaceId}/tasks` },
        { label: "Chat", href: `/${workspaceId}/chat` },
        { label: "Activity", href: `/${workspaceId}/activity` },
        { label: "Analytics", href: `/${workspaceId}/analytics` },
        ...(role === "ADMIN"
            ? [{ label: "Settings", href: `/${workspaceId}/settings` }]
            : []),
    ];
}

export function isSectionCurrent(
    pathname: string,
    section: Pick<WorkspaceSection, "href" | "exact">,
): boolean {
    if (section.exact) return pathname === section.href;
    return pathname === section.href || pathname.startsWith(`${section.href}/`);
}
