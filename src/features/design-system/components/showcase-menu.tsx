"use client";

import { useId, useState } from "react";
import Link from "next/link";

import { BurgerButton } from "@/components/paddock/paddock-button";
import { MenuOverlay } from "@/components/paddock/menu-overlay";
import { Tag } from "@/components/paddock/tag";
import {
    DEMO_RECENT_DOCUMENTS,
    SHOWCASE_INDEX,
} from "@/features/design-system/lib/paddock-demo-data";

export interface ShowcaseMenuProps {
    /** The section to mark as current, to demonstrate the squiggle. */
    currentId?: string;
}

/** The burger and the full-screen menu, wired to this page's sections. */
export function ShowcaseMenu({ currentId = "navigation" }: ShowcaseMenuProps) {
    const [open, setOpen] = useState(false);
    const menuId = useId();

    return (
        <>
            <BurgerButton
                open={open}
                controls={menuId}
                onClick={() => setOpen(true)}
            />
            <MenuOverlay
                id={menuId}
                open={open}
                onClose={() => setOpen(false)}
                cards={DEMO_RECENT_DOCUMENTS}
                items={SHOWCASE_INDEX.map((entry) => ({
                    label: entry.label,
                    href: `#${entry.id}`,
                    current: entry.id === currentId,
                }))}
                footer={
                    <>
                        <Tag tone="night-subtle">
                            Paddock · design system v2
                        </Tag>
                        <Link
                            href="/design-system"
                            onClick={() => setOpen(false)}
                            className="paddock-tag text-[0.6875rem] text-paddock-night-fg underline underline-offset-4"
                        >
                            Current (v1)
                        </Link>
                    </>
                }
            />
        </>
    );
}
