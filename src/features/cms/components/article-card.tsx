import Link from "next/link";

import { NotchedCard } from "@/components/paddock/notched-card";
import { Tag } from "@/components/paddock/tag";
import { formatCalendarDate } from "@/lib/format-time";

import type { Article } from "../schemas/content";

export interface ArticleCardProps {
    article: Article;
}

/** One blog article in the list: category tab, title, excerpt, byline. */
export function ArticleCard({ article }: ArticleCardProps) {
    const date = formatCalendarDate(article.publishedAt ?? null);

    return (
        <NotchedCard
            as="li"
            tone="sheet"
            tab={article.category ?? undefined}
            className="h-full"
            bodyClassName="flex h-full flex-col gap-3 p-6"
        >
            <h2 className="m-0 text-xl font-bold leading-snug">
                <Link
                    href={`/blog/${article.slug}`}
                    className="text-paddock-ink no-underline hover:underline"
                >
                    {article.title}
                </Link>
            </h2>
            {article.excerpt ? (
                <p className="m-0 flex-1 text-paddock-subtle">
                    {article.excerpt}
                </p>
            ) : (
                <span className="flex-1" />
            )}
            <Tag>{[article.author, date].filter(Boolean).join(" · ")}</Tag>
        </NotchedCard>
    );
}
