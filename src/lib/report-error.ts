import { captureException } from "@sentry/nextjs";

export interface ReportErrorContext {
    /** Added as a Sentry tag, so a workspace's failures can be filtered. */
    workspaceId?: string;
    /** Non-sensitive details worth having next to the stack. */
    extra?: Record<string, unknown>;
}

/**
 * Logs an unexpected failure and sends it to Sentry. Every `catch` that turns
 * an exception into a readable error result calls this instead of
 * `console.error`, so monitoring has one entry point.
 *
 * Only report what is a bug or an outage: validation errors, auth refusals and
 * an unconfigured integration are expected and must not reach here. Without a
 * DSN the Sentry call is a no-op and this is exactly `console.error`.
 */
export function reportError(
    label: string,
    error: unknown,
    context: ReportErrorContext = {},
): void {
    console.error(label, error);

    try {
        captureException(error, {
            tags: {
                source: label,
                ...(context.workspaceId
                    ? { workspace_id: context.workspaceId }
                    : {}),
            },
            extra: context.extra,
        });
    } catch {
        // Monitoring must never fail the request that is being reported.
    }
}

/**
 * Reports an error an `error.tsx` / `global-error.tsx` boundary caught, once.
 *
 * An error with a `digest` was thrown on the server, where `onRequestError`
 * has already captured it; the browser only has the redacted copy, so sending
 * it again would double-count. An error without one happened in the browser.
 */
export function reportBoundaryError(
    error: Error & { digest?: string },
    boundary: string,
): void {
    if (error.digest) return;

    try {
        captureException(error, { tags: { source: boundary } });
    } catch {
        // Monitoring must never break the error screen itself.
    }
}
