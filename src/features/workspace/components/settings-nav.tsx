"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

interface SettingsNavProps {
    workspaceId: string;
}

export function SettingsNav({ workspaceId }: SettingsNavProps) {
    const pathname = usePathname();

    const tabs = [
        {
            label: "General",
            href: `/${workspaceId}/settings`,
            exact: true,
        },
        {
            label: "Members",
            href: `/${workspaceId}/settings/members`,
            exact: false,
        },
        {
            label: "Billing",
            href: `/${workspaceId}/settings/billing`,
            exact: false,
        },
    ];

    const isActive = (href: string, exact: boolean) => {
        if (!pathname) return false;
        if (exact) {
            return pathname === href;
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    return (
        <nav
            className="flex items-center gap-2 border-b-2 border-brand-muted mb-8"
            aria-label="Settings navigation tabs"
        >
            {tabs.map((tab) => {
                const active = isActive(tab.href, tab.exact);
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            "px-4 py-3 font-brand-mono text-xs uppercase tracking-wider transition-colors border-b-2 -mb-[2px]",
                            active
                                ? "border-brand-accent text-brand-ink font-semibold"
                                : "border-transparent text-brand-subtle hover:text-brand-ink hover:border-brand-border",
                        )}
                        aria-current={active ? "page" : undefined}
                    >
                        {tab.label}
                    </Link>
                );
            })}
        </nav>
    );
}
