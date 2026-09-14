"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import Link from "next/link";

import { NavTabs, type NavTabItem } from "@/components/ui/nav-tabs";
import { UserAvatar } from "@/components/ui/user-avatar";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { cn } from "@/lib/cn";
import { WORKSPACE_ROLE_LABELS, type WorkspaceRole } from "@/schemas/workspace";

export interface WorkspaceNavMember {
    id: string;
    name: string;
    image: string | null;
}

export interface WorkspaceNavProps {
    workspaceId: string;
    workspaceName: string;
    userRole: WorkspaceRole;
    workspaces?: { id: string; name: string }[];
    /** Everyone with access, so their hues are learnable from any screen. */
    members?: WorkspaceNavMember[];
}

export function WorkspaceNav({
    workspaceId,
    workspaceName,
    userRole,
    workspaces = [],
    members = [],
}: WorkspaceNavProps) {
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    useOutsideClick(switcherRef, () => setSwitcherOpen(false), switcherOpen);

    const navItems: NavTabItem[] = [
        { label: "Overview", href: `/${workspaceId}`, exact: true },
        { label: "Documents", href: `/${workspaceId}/documents` },
        { label: "Tasks", href: `/${workspaceId}/tasks` },
        { label: "Chat", href: `/${workspaceId}/chat` },
        { label: "Activity", href: `/${workspaceId}/activity` },
        { label: "Analytics", href: `/${workspaceId}/analytics` },
        ...(userRole === "ADMIN"
            ? [{ label: "Settings", href: `/${workspaceId}/settings` }]
            : []),
    ];

    const shownMembers = members.slice(0, 6);
    const overflow = members.length - shownMembers.length;

    return (
        <div className="border-b border-brand-border bg-brand-surface mb-7 w-full max-w-full overflow-x-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full min-w-0">
                <div className="flex items-center justify-between gap-4 py-3">
                    <div className="relative min-w-0" ref={switcherRef}>
                        <button
                            type="button"
                            onClick={() => setSwitcherOpen(!switcherOpen)}
                            className="flex items-center gap-2.5 group cursor-pointer rounded-brand -m-1 p-1 min-w-0"
                            aria-expanded={switcherOpen}
                            aria-haspopup="true"
                        >
                            <span className="w-7 h-7 rounded-brand bg-brand-ink text-brand-paper text-[13px] font-semibold flex items-center justify-center uppercase shrink-0">
                                {(workspaceName || "W").charAt(0)}
                            </span>
                            <span className="text-[15px] font-semibold tracking-[-0.011em] text-brand-ink truncate">
                                {workspaceName || "Workspace"}
                            </span>
                            <ChevronDown
                                aria-hidden="true"
                                className={cn(
                                    "w-4 h-4 text-brand-subtle transition-transform shrink-0",
                                    switcherOpen && "rotate-180",
                                )}
                            />
                        </button>

                        {switcherOpen && (
                            <div className="absolute left-0 mt-2 w-64 bg-brand-surface border-2 border-brand-ink shadow-brand-card rounded-brand py-1 z-50 animate-pop-in">
                                <div className="max-h-56 overflow-y-auto">
                                    {workspaces.map((ws) => (
                                        <Link
                                            key={ws.id}
                                            href={`/${ws.id}`}
                                            onClick={() =>
                                                setSwitcherOpen(false)
                                            }
                                            className={cn(
                                                "flex items-center justify-between gap-2 px-3 py-2 text-sm transition-colors",
                                                ws.id === workspaceId
                                                    ? "bg-brand-muted text-brand-ink font-semibold"
                                                    : "text-brand-ink hover:bg-brand-muted",
                                            )}
                                        >
                                            <span className="truncate">
                                                {ws.name}
                                            </span>
                                            {ws.id === workspaceId && (
                                                <Check
                                                    aria-hidden="true"
                                                    className="w-3.5 h-3.5 shrink-0"
                                                />
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                <div className="border-t border-brand-border mt-1 pt-1">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setSwitcherOpen(false)}
                                        className="block px-3 py-2 text-sm text-brand-subtle hover:bg-brand-muted hover:text-brand-ink transition-colors"
                                    >
                                        All workspaces
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* The team, each in their own hue. Seeing the same colours
                        here that appear on cards, carets and messages is what
                        makes the colour learnable in the first place. */}
                    <div className="flex items-center gap-3 shrink-0">
                        {shownMembers.length > 0 && (
                            <Link
                                href={`/${workspaceId}/settings/members`}
                                className="flex items-center gap-1.5 group"
                                title={`${members.length} ${members.length === 1 ? "person has" : "people have"} access`}
                            >
                                <span className="flex items-center -space-x-1">
                                    {shownMembers.map((member) => (
                                        <UserAvatar
                                            key={member.id}
                                            user={{
                                                id: member.id,
                                                name: member.name,
                                                image: member.image,
                                            }}
                                            size="sm"
                                            className="ring-2 ring-brand-surface transition-transform group-hover:ring-brand-muted"
                                        />
                                    ))}
                                </span>
                                {overflow > 0 && (
                                    <span className="text-[13px] text-brand-subtle tabular-nums">
                                        +{overflow}
                                    </span>
                                )}
                            </Link>
                        )}
                        <span className="text-[13px] text-brand-subtle">
                            {WORKSPACE_ROLE_LABELS[userRole]}
                        </span>
                    </div>
                </div>

                <NavTabs
                    ariaLabel="Workspace sections"
                    scrollable
                    items={navItems}
                    className="border-b-0"
                />
            </div>
        </div>
    );
}
