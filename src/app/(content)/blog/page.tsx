import type { Metadata } from "next";

import { PageHeader } from "@/components/layout/page-header";
import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { ArticleCard } from "@/features/cms/components/article-card";
import { ContentEmpty } from "@/features/cms/components/content-empty";
import { ContentNotice } from "@/features/cms/components/content-notice";
import { ContentPagination } from "@/features/cms/components/content-pagination";
import { getArticles } from "@/features/cms/queries/get-content";
import { pageParamSchema } from "@/features/cms/schemas/content";

export const metadata: Metadata = {
    title: "Blog",
    description: "Stories and notes from the team building Converge.",
};

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
    const { page: pageParam } = await searchParams;
    const page = pageParamSchema.parse(
        Array.isArray(pageParam) ? pageParam[0] : pageParam,
    );
    const result = await getArticles(page);

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
                eyebrow="Blog"
                serif="Notes from"
                heavy="the team"
                description="Stories, how-tos and thinking behind a workspace where everyone types at once."
            />
            <div className={`${PAGE_CONTAINER} pb-20`}>
                {items.length === 0 ? (
                    <ContentEmpty
                        title="No articles yet"
                        description="Nothing has been published. Check back soon."
                    />
                ) : (
                    <ul className="m-0 grid list-none gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
                        {items.map((article) => (
                            <ArticleCard
                                key={article.documentId}
                                article={article}
                            />
                        ))}
                    </ul>
                )}
                <ContentPagination basePath="/blog" pagination={pagination} />
            </div>
        </main>
    );
}
