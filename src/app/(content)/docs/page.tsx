import type { Metadata } from "next";
import Link from "next/link";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { NotchedCard } from "@/components/paddock/notched-card";
import { ContentEmpty } from "@/features/cms/components/content-empty";
import { ContentNotice } from "@/features/cms/components/content-notice";
import {
    getDocs,
    groupDocsBySection,
} from "@/features/cms/queries/get-content";

export const metadata: Metadata = {
    title: "Documentation",
    description: "Guides and reference for working in Converge.",
};

export default async function DocsPage() {
    const result = await getDocs();

    if (!result.success) {
        return (
            <ContentNotice
                notConfigured={result.notConfigured}
                error={result.error}
            />
        );
    }

    const sections = groupDocsBySection(result.data.items);

    return (
        <main>
            <PageHeader
                eyebrow="Documentation"
                serif="Learn"
                heavy="Converge"
                description="Guides for documents, boards, chat and your workspace."
            />
            <div className={`${PAGE_CONTAINER} pb-20`}>
                {sections.length === 0 ? (
                    <ContentEmpty
                        title="No documentation yet"
                        description="Guides will appear here once they are published."
                    />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                        {sections.map((section) => (
                            <NotchedCard
                                key={section.name}
                                as="section"
                                tone="sheet"
                                tab={section.name}
                                bodyClassName="p-6"
                            >
                                <h2 className="paddock-heavy m-0 mb-4 text-xl">
                                    {section.name}
                                </h2>
                                <ul className="m-0 flex list-none flex-col gap-3 p-0">
                                    {section.docs.map((doc) => (
                                        <li key={doc.documentId}>
                                            <Link
                                                href={`/docs/${doc.slug}`}
                                                className="font-semibold text-paddock-ink no-underline hover:underline"
                                            >
                                                {doc.title}
                                            </Link>
                                            {doc.summary ? (
                                                <p className="m-0 text-[0.9375rem] text-paddock-subtle">
                                                    {doc.summary}
                                                </p>
                                            ) : null}
                                        </li>
                                    ))}
                                </ul>
                            </NotchedCard>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
