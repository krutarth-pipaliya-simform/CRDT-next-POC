import { init } from "@sentry/nextjs";

import {
    readServerSentryConfig,
    SENTRY_DATA_COLLECTION,
} from "@/lib/sentry-config";

const config = readServerSentryConfig();

// No route here runs on the edge today; this keeps one that does monitored.
if (config.dsn) {
    init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        tracesSampleRate: config.tracesSampleRate,
        dataCollection: SENTRY_DATA_COLLECTION,
    });
}
