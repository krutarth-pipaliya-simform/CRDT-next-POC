import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";

import { CMS_CACHE_TAG } from "@/features/cms/lib/cms-client";
import { env } from "@/lib/env";

function digest(value: string): Buffer {
    return createHash("sha256").update(value).digest();
}

/** The secret from `Authorization: Bearer <secret>` or `X-Cms-Secret`. */
function presentedSecret(request: Request): string {
    const authorization = request.headers.get("authorization");
    if (authorization?.startsWith("Bearer ")) {
        return authorization.slice("Bearer ".length).trim();
    }
    return request.headers.get("x-cms-secret")?.trim() ?? "";
}

/**
 * Strapi webhook target (Settings > Webhooks > publish/unpublish events).
 * Marks every CMS fetch stale; the next visit to a content page refetches it.
 * Guarded by a shared secret; `api/cms` is excluded from the `proxy.ts`
 * matcher so the call is never redirected to /login.
 */
export async function POST(request: Request) {
    const secret = env.CMS_REVALIDATE_SECRET;
    if (!secret) {
        return Response.json(
            { error: "Revalidation is not configured." },
            { status: 503 },
        );
    }

    // Compare fixed-length digests so the check is constant-time.
    if (!timingSafeEqual(digest(presentedSecret(request)), digest(secret))) {
        return Response.json({ error: "Invalid secret." }, { status: 401 });
    }

    revalidateTag(CMS_CACHE_TAG, "max");
    return Response.json({ revalidated: true });
}
