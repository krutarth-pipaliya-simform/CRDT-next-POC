"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/cn";

export interface SettingsNavProps {
    workspaceId: string;
}

interface SettingsSection {
    label: string;
    href: string;
    /** General is the settings root, so it only matches itself. */
    exact: boolean;
}

/**
 * The settings sub-navigation: a pill track whose current section is an ink
 * fill. Ink, not lime, because this is where you are, not an action.
 */
export function SettingsNav({ workspaceId }: SettingsNavProps) {
    const pathname = usePathname();

    const sections: SettingsSection[] = [
        { label: "General", href: `/${workspaceId}/settings`, exact: true },
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

    const isCurrent = (section: SettingsSection) =>
        section.exact
            ? pathname === section.href
            : pathname === section.href ||
              pathname.startsWith(`${section.href}/`);

    return (
        <nav
            aria-label="Settings sections"
            className="flex max-w-full flex-wrap gap-1.5 rounded-[1.75rem] border-[1.5px] border-paddock-ink p-[5px]"
        >
            {sections.map((section) => {
                const current = isCurrent(section);
                return (
                    <Link
                        key={section.href}
                        href={section.href}
                        aria-current={current ? "page" : undefined}
                        className={cn(
                            "paddock-press inline-flex h-11 items-center rounded-full px-5 text-sm font-semibold no-underline",
                            current
                                ? "bg-paddock-inverse text-paddock-on-inverse"
                                : "text-paddock-ink hover:bg-paddock-ink/8",
                        )}
                    >
                        {section.label}
                    </Link>
                );
            })}
        </nav>
    );
}
