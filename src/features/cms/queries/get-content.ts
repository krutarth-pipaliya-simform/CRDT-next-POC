import {
    CMS_COLLECTIONS,
    fetchBySlug,
    fetchCollection,
    type CmsPage,
    type CmsResult,
} from "../lib/cms-client";
import {
    announcementSchema,
    articleSchema,
    docSchema,
    releaseNoteSchema,
    slugSchema,
    type Announcement,
    type Article,
    type Doc,
    type ReleaseNote,
} from "../schemas/content";

import "server-only";

export const ARTICLES_PAGE_SIZE = 6;
export const RELEASE_NOTES_PAGE_SIZE = 5;
export const ANNOUNCEMENTS_PAGE_SIZE = 5;

const NEWEST_FIRST = ["publishedAt:desc"];

export function getArticles(
    page: number,
): Promise<CmsResult<CmsPage<Article>>> {
    return fetchCollection(CMS_COLLECTIONS.article, articleSchema, {
        sort: NEWEST_FIRST,
        page,
        pageSize: ARTICLES_PAGE_SIZE,
    });
}

export async function getArticleBySlug(
    slug: string,
): Promise<CmsResult<Article | null>> {
    if (!slugSchema.safeParse(slug).success) {
        return { success: true, data: null };
    }
    return fetchBySlug(CMS_COLLECTIONS.article, articleSchema, slug);
}

export function getAnnouncements(
    page: number,
    pageSize: number = ANNOUNCEMENTS_PAGE_SIZE,
): Promise<CmsResult<CmsPage<Announcement>>> {
    return fetchCollection(CMS_COLLECTIONS.announcement, announcementSchema, {
        sort: NEWEST_FIRST,
        page,
        pageSize,
    });
}

export function getReleaseNotes(
    page: number,
): Promise<CmsResult<CmsPage<ReleaseNote>>> {
    return fetchCollection(CMS_COLLECTIONS.releaseNote, releaseNoteSchema, {
        sort: ["releaseDate:desc"],
        page,
        pageSize: RELEASE_NOTES_PAGE_SIZE,
    });
}

/** Every documentation page, ordered by section then position. */
export function getDocs(): Promise<CmsResult<CmsPage<Doc>>> {
    return fetchCollection(CMS_COLLECTIONS.doc, docSchema, {
        sort: ["section:asc", "order:asc", "title:asc"],
        pageSize: 100,
    });
}

export async function getDocBySlug(
    slug: string,
): Promise<CmsResult<Doc | null>> {
    if (!slugSchema.safeParse(slug).success) {
        return { success: true, data: null };
    }
    return fetchBySlug(CMS_COLLECTIONS.doc, docSchema, slug);
}

export interface DocSection {
    name: string;
    docs: Doc[];
}

/** Group an already-ordered list by section, keeping first-seen order. */
export function groupDocsBySection(docs: Doc[]): DocSection[] {
    const sections: DocSection[] = [];
    for (const doc of docs) {
        const existing = sections.find(
            (section) => section.name === doc.section,
        );
        if (existing) {
            existing.docs.push(doc);
        } else {
            sections.push({ name: doc.section, docs: [doc] });
        }
    }
    return sections;
}
