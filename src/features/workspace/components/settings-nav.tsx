"use client";

import { NavTabs, type NavTabItem } from "@/components/ui/nav-tabs";

interface SettingsNavProps {
    workspaceId: string;
}

export function SettingsNav({ workspaceId }: SettingsNavProps) {
    const tabs: NavTabItem[] = [
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

    return (
        <NavTabs
            ariaLabel="Settings navigation tabs"
            items={tabs}
            className="mb-8"
        />
    );
}
