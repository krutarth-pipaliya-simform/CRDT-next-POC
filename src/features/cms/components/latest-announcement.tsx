import Link from "next/link";

import { Tag } from "@/components/paddock/tag";

import { getAnnouncements } from "../queries/get-content";

export interface LatestAnnouncementProps {
    /** Extra classes on the outer strip, e.g. spacing from the page. */
    className?: string;
}

/**
 * A one-line strip with the newest product announcement. Renders nothing when
 * the CMS is unconfigured, down or empty: a missing strip is not an error on
 * a page whose job is something else.
 */
export async function LatestAnnouncement({
    className,
}: LatestAnnouncementProps) {
    const result = await getAnnouncements(1, 1);
    if (!result.success) return null;
    const latest = result.data.items[0];
    if (!latest) return null;

    return (
        <aside
            aria-label="Latest announcement"
            data-testid="latest-announcement"
            className={className}
        >
            <Link
                href="/announcements"
                className="paddock-night flex flex-wrap items-center gap-x-4 gap-y-1 rounded-paddock-panel px-5 py-3 no-underline"
            >
                <Tag tone="lime">New</Tag>
                <span className="min-w-0 flex-1 font-semibold text-paddock-night-fg">
                    {latest.title}
                </span>
                <Tag tone="night-subtle">All announcements</Tag>
            </Link>
        </aside>
    );
}
