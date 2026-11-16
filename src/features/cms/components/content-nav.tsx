"use client";

import { usePathname } from "next/navigation";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { WorkspaceTabs } from "@/components/paddock/workspace-tabs";

import {
    CONTENT_SECTIONS,
    isContentSectionCurrent,
} from "../lib/content-sections";

/** The tab bar between Blog, Announcements, Docs and Changelog. */
export function ContentNav() {
    const pathname = usePathname();

    return (
        <div className="border-b border-paddock-rule">
            <div className={PAGE_CONTAINER}>
                <WorkspaceTabs
                    label="Content sections"
                    items={CONTENT_SECTIONS.map((section) => ({
                        label: section.label,
                        href: section.href,
                        current: isContentSectionCurrent(pathname, section),
                    }))}
                />
            </div>
        </div>
    );
}
