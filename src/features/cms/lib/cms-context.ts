/**
 * Pure (no env, no `server-only`) so the unconfigured states can be unit
 * tested. `cms-config.ts` feeds it the real environment.
 */

export interface CmsContext {
    /** Origin of the Strapi instance, without a trailing slash. */
    baseUrl: string;
    token: string;
}

export type CmsContextResult =
    { success: true; data: CmsContext } | { success: false; error: string };

export const CMS_NOT_CONFIGURED_ERROR =
    "The content service is not configured. Set CMS_API_URL and CMS_API_TOKEN.";

export function resolveCmsContext(
    apiUrl: string | undefined,
    token: string | undefined,
): CmsContextResult {
    if (!apiUrl || !token) {
        return { success: false, error: CMS_NOT_CONFIGURED_ERROR };
    }
    return {
        success: true,
        data: { baseUrl: apiUrl.replace(/\/+$/, ""), token },
    };
}
