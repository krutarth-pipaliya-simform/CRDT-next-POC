import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { Tag } from "@/components/paddock/tag";
import { formatCalendarDate } from "@/lib/format-time";

import { safeLinkUrl } from "../lib/safe-url";
import type { Announcement } from "../schemas/content";

import { BlocksRenderer } from "./blocks-renderer";

export interface AnnouncementEntryProps {
    announcement: Announcement;
}

/** A product announcement in full: date, title, body and its call to action. */
export function AnnouncementEntry({ announcement }: AnnouncementEntryProps) {
    const date = formatCalendarDate(announcement.publishedAt ?? null);
    const ctaUrl = announcement.ctaUrl
        ? safeLinkUrl(announcement.ctaUrl)
        : null;

    return (
        <NotchedCard
            as="article"
            tone="sheet"
            bodyClassName="flex flex-col gap-4 p-6 sm:p-8"
        >
            {date ? <Tag as="p">{date}</Tag> : null}
            <h2 className="m-0 text-2xl font-bold">{announcement.title}</h2>
            <BlocksRenderer blocks={announcement.body} />
            {ctaUrl ? (
                <div>
                    <PaddockLinkButton href={ctaUrl}>
                        {announcement.ctaLabel ?? "Learn more"}
                    </PaddockLinkButton>
                </div>
            ) : null}
        </NotchedCard>
    );
}
