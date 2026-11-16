import type { Metadata } from "next";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { ContentEmpty } from "@/features/cms/components/content-empty";
import { ContentNotice } from "@/features/cms/components/content-notice";
import { ContentPagination } from "@/features/cms/components/content-pagination";
import { ReleaseNoteEntry } from "@/features/cms/components/release-note-entry";
import { getReleaseNotes } from "@/features/cms/queries/get-content";
import { pageParamSchema } from "@/features/cms/schemas/content";

export const metadata: Metadata = {
    title: "Changelog",
    description: "Release notes for every version of Converge.",
};

export default async function ChangelogPage({
    searchParams,
}: PageProps<"/changelog">) {
    const { page: pageParam } = await searchParams;
    const page = pageParamSchema.parse(
        Array.isArray(pageParam) ? pageParam[0] : pageParam,
    );
    const result = await getReleaseNotes(page);

    if (!result.success) {
        return (
            <ContentNotice
                notConfigured={result.notConfigured}
                error={result.error}
            />
        );
    }

    const { items, pagination } = result.data;

    return (
        <main>
            <PageHeader
                eyebrow="Release notes"
                serif="The"
                heavy="changelog"
                description="Every release, newest first."
            />
            <div className={`${PAGE_CONTAINER} pb-20`}>
                {items.length === 0 ? (
                    <ContentEmpty
                        title="No releases yet"
                        description="Release notes will appear here."
                    />
                ) : (
                    <div className="max-w-[60rem]">
                        {items.map((note) => (
                            <ReleaseNoteEntry
                                key={note.documentId}
                                note={note}
                            />
                        ))}
                    </div>
                )}
                <ContentPagination
                    basePath="/changelog"
                    pagination={pagination}
                />
            </div>
        </main>
    );
}
