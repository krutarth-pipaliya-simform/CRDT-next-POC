import type { init } from "@sentry/nextjs";
import { z } from "zod";

/**
 * Sentry settings, shared by the browser, Node and edge inits.
 *
 * Deliberately not part of `env.ts`: the browser bundle cannot load that
 * module (it validates server secrets), and `NEXT_PUBLIC_*` values only reach
 * the browser when they are spelled out literally in the source. Callers pass
 * the raw values in. Nothing here ever throws: a malformed value falls back to
 * its default, and no DSN means monitoring is simply off.
 */

const blankToUndefined = (value: unknown) =>
    typeof value === "string" && value.trim() === "" ? undefined : value;

const dsnSchema = z.preprocess(
    blankToUndefined,
    z.url().optional().catch(undefined),
);

const textSchema = z.preprocess(
    blankToUndefined,
    z.string().trim().optional().catch(undefined),
);

const rateSchema = (fallback: number) =>
    z.preprocess(
        blankToUndefined,
        z.coerce.number().min(0).max(1).catch(fallback),
    );

const flagSchema = z.preprocess(
    blankToUndefined,
    z
        .enum(["true", "false"])
        .transform((value) => value === "true")
        .catch(false),
);

/** Share of requests and page loads traced when nothing is configured. */
export const DEFAULT_TRACES_SAMPLE_RATE = 0.1;

export interface SentryRawConfig {
    dsn?: string;
    environment?: string;
    release?: string;
    tracesSampleRate?: string;
    replayEnabled?: string;
    replayOnErrorSampleRate?: string;
}

export interface SentryConfig {
    /** Without a DSN the SDK is never initialised. */
    dsn: string | undefined;
    environment: string;
    release: string | undefined;
    tracesSampleRate: number;
    replayEnabled: boolean;
    replayOnErrorSampleRate: number;
}

export function readSentryConfig(raw: SentryRawConfig): SentryConfig {
    return {
        dsn: dsnSchema.parse(raw.dsn),
        environment:
            textSchema.parse(raw.environment) ??
            (process.env.NODE_ENV === "production"
                ? "production"
                : "development"),
        release: textSchema.parse(raw.release),
        tracesSampleRate: rateSchema(DEFAULT_TRACES_SAMPLE_RATE).parse(
            raw.tracesSampleRate,
        ),
        replayEnabled: flagSchema.parse(raw.replayEnabled),
        replayOnErrorSampleRate: rateSchema(1).parse(
            raw.replayOnErrorSampleRate,
        ),
    };
}

/** The server and edge runtimes read the private variable first. */
export function readServerSentryConfig(): SentryConfig {
    return readSentryConfig({
        dsn: process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN,
        environment:
            process.env.SENTRY_ENVIRONMENT ||
            process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
        release:
            process.env.SENTRY_RELEASE ||
            process.env.NEXT_PUBLIC_SENTRY_RELEASE,
        tracesSampleRate:
            process.env.SENTRY_TRACES_SAMPLE_RATE ||
            process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    });
}

/**
 * What the SDK may collect. Everything personal or bulky is off: no cookies,
 * headers, query strings, request bodies, query data or local variables, and
 * no user fields filled in automatically. The only user data sent is the
 * opaque id set by `SentryScope`.
 */
export const SENTRY_DATA_COLLECTION: NonNullable<
    Parameters<typeof init>[0]["dataCollection"]
> = {
    userInfo: false,
    cookies: false,
    httpHeaders: false,
    httpBodies: [],
    urlQueryParams: false,
    databaseQueryData: false,
    queues: false,
    stackFrameVariables: false,
};
