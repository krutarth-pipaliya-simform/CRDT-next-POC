import type { Metadata } from "next";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { AnnouncementEntry } from "@/features/cms/components/announcement-entry";
import { ContentEmpty } from "@/features/cms/components/content-empty";
import { ContentNotice } from "@/features/cms/components/content-notice";
import { ContentPagination } from "@/features/cms/components/content-pagination";
import { getAnnouncements } from "@/features/cms/queries/get-content";
import { pageParamSchema } from "@/features/cms/schemas/content";

export const metadata: Metadata = {
    title: "Announcements",
    description: "Product announcements from the Converge team.",
};

export default async function AnnouncementsPage({
    searchParams,
}: PageProps<"/announcements">) {
    const { page: pageParam } = await searchParams;
    const page = pageParamSchema.parse(
        Array.isArray(pageParam) ? pageParam[0] : pageParam,
    );
    const result = await getAnnouncements(page);

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
                eyebrow="Product"
                serif="What's"
                heavy="new"
                description="Launches and changes worth knowing about."
            />
            <div className={`${PAGE_CONTAINER} pb-20`}>
                {items.length === 0 ? (
                    <ContentEmpty
                        title="No announcements yet"
                        description="Nothing has been announced. Check back soon."
                    />
                ) : (
                    <div className="flex max-w-[52rem] flex-col gap-6">
                        {items.map((announcement) => (
                            <AnnouncementEntry
                                key={announcement.documentId}
                                announcement={announcement}
                            />
                        ))}
                    </div>
                )}
                <ContentPagination
                    basePath="/announcements"
                    pagination={pagination}
                />
            </div>
        </main>
    );
}
