import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ContentArticle } from "@/features/cms/components/content-article";
import { ContentNotice } from "@/features/cms/components/content-notice";
import { getArticleBySlug } from "@/features/cms/queries/get-content";
import { formatCalendarDate } from "@/lib/format-time";

export async function generateMetadata({
    params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
    const { slug } = await params;
    const result = await getArticleBySlug(slug);
    if (!result.success || !result.data) return { title: "Blog" };

    const article = result.data;
    return {
        title: article.title,
        description: article.excerpt ?? undefined,
        openGraph: {
            type: "article",
            title: article.title,
            description: article.excerpt ?? undefined,
            publishedTime: article.publishedAt ?? undefined,
            authors: article.author ? [article.author] : undefined,
        },
    };
}

export default async function BlogArticlePage({
    params,
}: PageProps<"/blog/[slug]">) {
    const { slug } = await params;
    const result = await getArticleBySlug(slug);

    if (!result.success) {
        return (
            <ContentNotice
                notConfigured={result.notConfigured}
                error={result.error}
            />
        );
    }
    if (!result.data) notFound();

    const article = result.data;
    const date = formatCalendarDate(article.publishedAt ?? null);

    return (
        <ContentArticle
            back={{ href: "/blog", label: "Blog" }}
            eyebrow={[article.category, article.author, date]
                .filter(Boolean)
                .join(" · ")}
            title={article.title}
            lead={article.excerpt}
            body={article.body}
        />
    );
}
