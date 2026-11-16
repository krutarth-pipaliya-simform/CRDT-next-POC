import { captureRequestError } from "@sentry/nextjs";

export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        await import("./sentry.server.config");
    }

    if (process.env.NEXT_RUNTIME === "edge") {
        await import("./sentry.edge.config");
    }
}

/**
 * Next calls this for every error thrown while rendering a Server Component,
 * running a Route Handler or executing a Server Action. A no-op without a DSN.
 */
export const onRequestError = captureRequestError;
