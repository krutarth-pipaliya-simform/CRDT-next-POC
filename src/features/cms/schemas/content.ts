import { z } from "zod";

import { blocksSchema } from "./blocks";

/**
 * Strapi v5 returns flat attributes next to `id` and `documentId`. Built-in
 * fields (`createdAt`, `updatedAt`, `publishedAt`) are ISO strings. Optional
 * attributes arrive as `null` when empty, hence `nullish()`.
 */
const documentBase = {
    id: z.number(),
    documentId: z.string(),
    publishedAt: z.string().nullish(),
    updatedAt: z.string().nullish(),
};

export const articleSchema = z.object({
    ...documentBase,
    title: z.string(),
    slug: z.string(),
    excerpt: z.string().nullish(),
    author: z.string().nullish(),
    category: z.string().nullish(),
    body: blocksSchema,
});

export const announcementSchema = z.object({
    ...documentBase,
    title: z.string(),
    slug: z.string(),
    summary: z.string().nullish(),
    ctaLabel: z.string().nullish(),
    ctaUrl: z.string().nullish(),
    body: blocksSchema,
});

export const docSchema = z.object({
    ...documentBase,
    title: z.string(),
    slug: z.string(),
    section: z.string(),
    order: z.number().nullish(),
    summary: z.string().nullish(),
    body: blocksSchema,
});

export const releaseNoteSchema = z.object({
    ...documentBase,
    version: z.string(),
    title: z.string(),
    slug: z.string(),
    releaseDate: z.string(),
    summary: z.string().nullish(),
    body: blocksSchema,
});

export type Article = z.infer<typeof articleSchema>;
export type Announcement = z.infer<typeof announcementSchema>;
export type Doc = z.infer<typeof docSchema>;
export type ReleaseNote = z.infer<typeof releaseNoteSchema>;

export const paginationSchema = z.object({
    page: z.number(),
    pageSize: z.number(),
    pageCount: z.number(),
    total: z.number(),
});

export type Pagination = z.infer<typeof paginationSchema>;

/** The envelope of `GET /api/<collection>` in Strapi v5. */
export function collectionResponseSchema<T extends z.ZodType>(item: T) {
    return z.object({
        data: z.array(item),
        meta: z.object({ pagination: paginationSchema }),
    });
}

/** A URL slug; anything else is a miss without asking the CMS. */
export const slugSchema = z
    .string()
    .min(1)
    .max(120)
    .regex(/^[A-Za-z0-9][A-Za-z0-9_-]*$/);

/** Page number from a `?page=` search param; anything invalid is page 1. */
export const pageParamSchema = z.coerce.number().int().min(1).catch(1);
