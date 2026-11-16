import { z } from "zod";

import { collectionResponseSchema, type Pagination } from "../schemas/content";

import { getCmsContext } from "./cms-config";

import "server-only";

/** Strapi REST plural API ids, one per content type (see `cms/`). */
export const CMS_COLLECTIONS = {
    article: "articles",
    announcement: "announcements",
    doc: "docs",
    releaseNote: "release-notes",
} as const;

export type CmsCollection =
    (typeof CMS_COLLECTIONS)[keyof typeof CMS_COLLECTIONS];

/** Every CMS fetch carries this tag, so one webhook can drop them all. */
export const CMS_CACHE_TAG = "cms";

/** Seconds a CMS response is reused before a background refresh. */
const CMS_REVALIDATE_SECONDS = 300;
const CMS_TIMEOUT_MS = 8000;

export interface CmsListOptions {
    /** `field:asc` / `field:desc`, in priority order. */
    sort?: string[];
    page?: number;
    pageSize?: number;
    /** `filters[field][$eq]=value` pairs. */
    equals?: Record<string, string>;
}

export interface CmsPage<T> {
    items: T[];
    pagination: Pagination;
}

export type CmsResult<T> =
    | { success: true; data: T }
    | { success: false; error: string; notConfigured: boolean };

/**
 * Build the Strapi v5 query string. Bracket syntax is what Strapi parses
 * (`qs`), so keys are left as written rather than percent-encoded by hand.
 */
function buildQuery(options: CmsListOptions): string {
    const params = new URLSearchParams();
    options.sort?.forEach((rule, index) => {
        params.set(`sort[${index}]`, rule);
    });
    params.set("pagination[page]", String(options.page ?? 1));
    params.set("pagination[pageSize]", String(options.pageSize ?? 10));
    for (const [field, value] of Object.entries(options.equals ?? {})) {
        params.set(`filters[${field}][$eq]`, value);
    }
    return params.toString();
}

/**
 * `GET {CMS_API_URL}/api/<collection>` with the bearer token, validated with
 * Zod. Server-only: the token never reaches the browser. Responses are cached
 * by the Next data cache for five minutes and tagged `cms` for on-demand
 * revalidation (`POST /api/cms/revalidate`). Strapi returns published entries
 * unless `status=draft` is asked for, so drafts are never listed.
 */
export async function fetchCollection<T extends z.ZodType>(
    collection: CmsCollection,
    itemSchema: T,
    options: CmsListOptions = {},
): Promise<CmsResult<CmsPage<z.infer<T>>>> {
    const context = getCmsContext();
    if (!context.success) {
        return {
            success: false,
            error: context.error,
            notConfigured: true,
        };
    }

    const url = `${context.data.baseUrl}/api/${collection}?${buildQuery(options)}`;

    let response: Response;
    try {
        response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${context.data.token}`,
                Accept: "application/json",
            },
            signal: AbortSignal.timeout(CMS_TIMEOUT_MS),
            next: {
                revalidate: CMS_REVALIDATE_SECONDS,
                tags: [CMS_CACHE_TAG, `${CMS_CACHE_TAG}:${collection}`],
            },
        });
    } catch (error) {
        console.error(`CMS request for ${collection} failed`, error);
        return {
            success: false,
            error: "The content service could not be reached. Try again in a moment.",
            notConfigured: false,
        };
    }

    if (response.status === 401 || response.status === 403) {
        console.error(`CMS rejected the token for ${collection}`);
        return {
            success: false,
            error: "The content service rejected our access token. Check CMS_API_TOKEN and its permissions.",
            notConfigured: false,
        };
    }
    if (!response.ok) {
        console.error(`CMS returned ${response.status} for ${collection}`);
        return {
            success: false,
            error: `The content service answered with an error (${response.status}).`,
            notConfigured: false,
        };
    }

    let json: unknown;
    try {
        json = await response.json();
    } catch (error) {
        console.error(`CMS sent invalid JSON for ${collection}`, error);
        return {
            success: false,
            error: "The content service sent a response we could not read.",
            notConfigured: false,
        };
    }

    const parsed = collectionResponseSchema(itemSchema).safeParse(json);
    if (!parsed.success) {
        console.error(
            `CMS response for ${collection} did not match the expected shape`,
            z.prettifyError(parsed.error),
        );
        return {
            success: false,
            error: "The content service sent data in an unexpected shape.",
            notConfigured: false,
        };
    }

    return {
        success: true,
        data: {
            items: parsed.data.data,
            pagination: parsed.data.meta.pagination,
        },
    };
}

/** The first entry whose `slug` equals the given one, or `null`. */
export async function fetchBySlug<T extends z.ZodType>(
    collection: CmsCollection,
    itemSchema: T,
    slug: string,
): Promise<CmsResult<z.infer<T> | null>> {
    const result = await fetchCollection(collection, itemSchema, {
        equals: { slug },
        pageSize: 1,
    });
    if (!result.success) return result;
    return { success: true, data: result.data.items[0] ?? null };
}
