export interface ContentSection {
    label: string;
    href: string;
}

/**
 * The public content sections, in navigation order. The section tab bar and
 * the footer links read this one list, so they cannot disagree.
 */
export const CONTENT_SECTIONS: ContentSection[] = [
    { label: "Blog", href: "/blog" },
    { label: "Announcements", href: "/announcements" },
    { label: "Docs", href: "/docs" },
    { label: "Changelog", href: "/changelog" },
];

export function isContentSectionCurrent(
    pathname: string,
    section: ContentSection,
): boolean {
    return pathname === section.href || pathname.startsWith(`${section.href}/`);
}
