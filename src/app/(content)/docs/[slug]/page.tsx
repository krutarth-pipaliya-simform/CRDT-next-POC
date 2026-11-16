import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentArticle } from "@/features/cms/components/content-article";
import { ContentNotice } from "@/features/cms/components/content-notice";
import { getDocBySlug } from "@/features/cms/queries/get-content";

export async function generateMetadata({
    params,
}: PageProps<"/docs/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const result = await getDocBySlug(slug);
    if (!result.success || !result.data) return { title: "Documentation" };

    return {
        title: result.data.title,
        description: result.data.summary ?? undefined,
    };
}

export default async function DocPage({ params }: PageProps<"/docs/[slug]">) {
    const { slug } = await params;
    const result = await getDocBySlug(slug);

    if (!result.success) {
        return (
            <ContentNotice
                notConfigured={result.notConfigured}
                error={result.error}
            />
        );
    }
    if (!result.data) notFound();

    const doc = result.data;

    return (
        <ContentArticle
            back={{ href: "/docs", label: "Documentation" }}
            eyebrow={doc.section}
            title={doc.title}
            lead={doc.summary}
            body={doc.body}
        />
    );
}
