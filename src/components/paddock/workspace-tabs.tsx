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
 * current one carries `aria-current="page"` rather than tab-widget roles.
 *
 * Where you are and where you could go never look alike. The current tab is a
 * lime pill with dark `on-fill` text (lime is selection), the same in both
 * themes, and it does not react to hover. Every other tab answers hover and
 * focus with ink text and the hand-drawn ink scribble. The row is pulled left
 * by the pill's padding so the first label still lines up with the page.
 */
export function WorkspaceTabs({ items, label, className }: WorkspaceTabsProps) {
    return (
        <nav aria-label={label} className={className}>
            <ul className="m-0 -ml-3.5 flex list-none flex-wrap gap-x-1 gap-y-1 p-0">
                {items.map((item) => (
                    <li key={item.href}>
                        <Link
                            href={item.href}
                            aria-current={item.current ? "page" : undefined}
                            className="group relative block py-2.5 text-[0.9375rem] font-semibold no-underline"
                        >
                            <span
                                className={cn(
                                    "block rounded-full px-3.5 py-1.5 transition-colors",
                                    item.current
                                        ? "bg-paddock-lime text-paddock-on-fill"
                                        : "text-paddock-subtle group-hover:text-paddock-ink",
                                )}
                            >
                                {item.label}
                            </span>
                            {item.current ? null : (
                                <Scribble
                                    shape="underline"
                                    trigger="hover"
                                    tone="ink"
                                    className="absolute bottom-0.5 left-3.5 h-3 w-[calc(100%-1.75rem)]"
                                />
                            )}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}
