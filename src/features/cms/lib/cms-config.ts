import { env } from "@/lib/env";

import { resolveCmsContext, type CmsContextResult } from "./cms-context";

import "server-only";

/**
 * Resolve the CMS origin and token, or a readable error. Returns a
 * discriminated union so callers never assert on possibly-undefined env vars.
 */
export function getCmsContext(): CmsContextResult {
    return resolveCmsContext(env.CMS_API_URL, env.CMS_API_TOKEN);
}
