"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { NavTabs, type NavTabItem } from "@/components/ui/nav-tabs";
import { cn } from "@/lib/cn";
import type { WorkspaceRole } from "@/schemas/workspace";

export interface WorkspaceNavProps {
    workspaceId: string;
    workspaceName: string;
    userRole: WorkspaceRole;
    workspaces?: { id: string; name: string }[];
}

export function WorkspaceNav({
    workspaceId,
    workspaceName,
    userRole,
    workspaces = [],
}: WorkspaceNavProps) {
    const [switcherOpen, setSwitcherOpen] = useState(false);
    const switcherRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                switcherRef.current &&
                !switcherRef.current.contains(event.target as Node)
            ) {
                setSwitcherOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const navItems: NavTabItem[] = [
        { label: "Overview", href: `/${workspaceId}`, exact: true },
        { label: "Documents", href: `/${workspaceId}/documents` },
        { label: "Tasks", href: `/${workspaceId}/tasks` },
        { label: "Chat", href: `/${workspaceId}/chat` },
        { label: "Analytics", href: `/${workspaceId}/analytics` },
        ...(userRole === "ADMIN"
            ? [{ label: "Settings", href: `/${workspaceId}/settings` }]
            : []),
    ];

    return (
        <div className="border-b-2 border-brand-muted bg-brand-surface mb-6">
            <div className="max-w-7xl mx-auto px-6">
                {/* Workspace Header & Switcher */}
                <div className="flex items-center justify-between py-4 border-b border-brand-border">
                    <div className="relative" ref={switcherRef}>
                        <button
                            type="button"
                            onClick={() => setSwitcherOpen(!switcherOpen)}
                            className="flex items-center gap-3 group focus:outline-none cursor-pointer"
                            aria-expanded={switcherOpen}
                            aria-haspopup="true"
                        >
                            <div className="w-8 h-8 rounded-brand bg-brand-ink text-brand-surface font-brand-mono text-sm font-bold flex items-center justify-center uppercase shadow-brand-subtle">
                                {(workspaceName || "W").charAt(0)}
                            </div>
                            <div className="text-left">
                                <div className="flex items-center gap-2">
                                    <span className="text-base font-semibold text-brand-ink group-hover:text-brand-accent transition-colors">
                                        {workspaceName || "Workspace"}
                                    </span>
                                    <svg
                                        className={cn(
                                            "w-4 h-4 text-brand-subtle transition-transform",
                                            switcherOpen && "rotate-180",
                                        )}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        {switcherOpen && (
                            <div className="absolute left-0 mt-2 w-64 bg-brand-surface border-2 border-brand-ink shadow-brand-card rounded-brand py-2 z-50 animate-fade-in-up">
                                <div className="px-3 py-1.5 font-brand-mono text-[10px] uppercase tracking-widest text-brand-subtle border-b border-brand-border">
                                    Switch Workspace
                                </div>
                                <div className="max-h-56 overflow-y-auto py-1">
                                    {workspaces.map((ws) => (
                                        <Link
                                            key={ws.id}
                                            href={`/${ws.id}`}
                                            onClick={() =>
                                                setSwitcherOpen(false)
                                            }
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors",
                                                ws.id === workspaceId
                                                    ? "bg-brand-muted text-brand-ink font-semibold"
                                                    : "text-brand-ink hover:bg-brand-muted/50",
                                            )}
                                        >
                                            <span className="truncate">
                                                {ws.name}
                                            </span>
                                            {ws.id === workspaceId && (
                                                <span className="text-brand-accent text-xs">
                                                    ✓
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                <div className="border-t border-brand-border pt-1 mt-1">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setSwitcherOpen(false)}
                                        className="block px-3 py-2 text-xs font-brand-mono text-brand-accent hover:bg-brand-muted/50 transition-colors uppercase tracking-wider"
                                    >
                                        ← All Workspaces
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <Badge
                            intent={userRole === "ADMIN" ? "default" : "muted"}
                        >
                            {userRole}
                        </Badge>
                    </div>
                </div>

                {/* Workspace Navigation Tabs */}
                <NavTabs
                    ariaLabel="Workspace sections"
                    scrollable
                    items={navItems}
                    className="border-b-0 pt-1"
                />
            </div>
        </div>
    );
}
