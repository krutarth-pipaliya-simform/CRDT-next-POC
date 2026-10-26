import Link from "next/link";

import { cn } from "@/lib/cn";

import { Scribble } from "./scribble";

export interface WorkspaceTab {
    label: string;
    href: string;
    current?: boolean;
}

export interface WorkspaceTabsProps {
    items: WorkspaceTab[];
    /** Names the landmark, e.g. "Workspace sections". */
    label: string;
    className?: string;
}

/**
 * Section navigation for a workspace. These are links between pages, so the
 * current one carries `aria-current="page"` rather than tab-widget roles. The
 * ink scribble draws in on hover and focus and stays drawn on the current page;
 * the current tab is also set in ink, so the state never rests on the stroke.
 */
export function WorkspaceTabs({ items, label, className }: WorkspaceTabsProps) {
    return (
        <nav aria-label={label} className={className}>
            <ul className="m-0 flex list-none flex-wrap gap-x-6.5 gap-y-1 p-0">
                {items.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            aria-current={item.current ? "page" : undefined}
                            className={cn(
                                "group relative block py-4 pb-4.5 text-[0.9375rem] font-semibold no-underline",
                                "transition-colors hover:text-paddock-ink",
                                item.current
                                    ? "text-paddock-ink"
                                    : "text-paddock-subtle",
                            )}
                        >
                            {item.label}
                            <Scribble
                                shape="underline"
                                trigger="hover"
                                tone="ink"
                                className="absolute bottom-1 left-0 h-3 w-full"
                            />
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
