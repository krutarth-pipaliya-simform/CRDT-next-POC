import { Tag } from "@/components/paddock/tag";
import { formatCalendarDate } from "@/lib/format-time";

import type { ReleaseNote } from "../schemas/content";

import { BlocksRenderer } from "./blocks-renderer";

export interface ReleaseNoteEntryProps {
    note: ReleaseNote;
}

/** One release in the changelog: version and date on the left, notes right. */
export function ReleaseNoteEntry({ note }: ReleaseNoteEntryProps) {
    const date = formatCalendarDate(note.releaseDate);

    return (
        <article className="grid gap-4 border-t border-paddock-rule py-8 md:grid-cols-[12rem_1fr] md:gap-10">
            <div className="flex flex-col gap-1.5">
                <span className="paddock-mono text-lg font-medium">
                    v{note.version.replace(/^v/i, "")}
                </span>
                {date ? <Tag>{date}</Tag> : null}
            </div>
            <div className="flex min-w-0 flex-col gap-4">
                <h2 className="m-0 text-2xl font-bold">{note.title}</h2>
                {note.summary ? (
                    <p className="m-0 text-paddock-subtle">{note.summary}</p>
                ) : null}
                <BlocksRenderer blocks={note.body} />
            </div>
        </article>
    );
}
