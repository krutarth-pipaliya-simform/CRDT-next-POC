import {
    browserTracingIntegration,
    captureRouterTransitionStart,
    init,
    replayIntegration,
} from "@sentry/nextjs";

import { readSentryConfig, SENTRY_DATA_COLLECTION } from "@/lib/sentry-config";

// `NEXT_PUBLIC_*` values are inlined into the bundle only when written out
// literally, so they are read here and handed to the config parser.
const config = readSentryConfig({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT,
    release: process.env.NEXT_PUBLIC_SENTRY_RELEASE,
    tracesSampleRate: process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE,
    replayEnabled: process.env.NEXT_PUBLIC_SENTRY_REPLAY,
    replayOnErrorSampleRate:
        process.env.NEXT_PUBLIC_SENTRY_REPLAY_ON_ERROR_SAMPLE_RATE,
});

// No DSN, no SDK: the app runs exactly as it did before monitoring existed.
if (config.dsn) {
    init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        // Page-load and navigation spans plus web vitals.
        integrations: [
            browserTracingIntegration(),
            ...(config.replayEnabled
                ? [
                      replayIntegration({
                          maskAllText: true,
                          blockAllMedia: true,
                      }),
                  ]
                : []),
        ],
        tracesSampleRate: config.tracesSampleRate,
        // Session replay is opt-in; when on, only sessions that hit an error
        // are recorded.
        replaysSessionSampleRate: 0,
        replaysOnErrorSampleRate: config.replayEnabled
            ? config.replayOnErrorSampleRate
            : 0,
        // No cookies, headers or bodies. Users are identified by id alone (see
        // `SentryScope`).
        dataCollection: SENTRY_DATA_COLLECTION,
    });
}

export function onRouterTransitionStart(
    url: string,
    navigationType: "push" | "replace" | "traverse",
) {
    captureRouterTransitionStart(url, navigationType);
}
