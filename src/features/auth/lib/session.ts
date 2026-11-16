import { cache } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { DEFAULT_UNAUTHENTICATED_REDIRECT } from "@/lib/routes";

import "server-only";

/**
 * The secure session check (the Data Access Layer check in Next's
 * authentication guide). `proxy.ts` only redirects optimistically; every
 * protected page calls this as well, so a request that reaches the page
 * without passing through the proxy still cannot render signed out.
 *
 * `returnTo` must be a same-origin path; it becomes the login page's
 * `callbackUrl` so the user lands back where they started.
 */
export const requireUserId = cache(
    async (returnTo?: string): Promise<string> => {
        const session = await auth();
        const userId = session?.user?.id;

        if (!userId) {
            const target =
                returnTo &&
                returnTo.startsWith("/") &&
                !returnTo.startsWith("//")
                    ? `${DEFAULT_UNAUTHENTICATED_REDIRECT}?callbackUrl=${encodeURIComponent(returnTo)}`
                    : DEFAULT_UNAUTHENTICATED_REDIRECT;
            redirect(target);
        }

        return userId;
    },
);
