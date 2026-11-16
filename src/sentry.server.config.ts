import { init } from "@sentry/nextjs";

import {
    readServerSentryConfig,
    SENTRY_DATA_COLLECTION,
} from "@/lib/sentry-config";

const config = readServerSentryConfig();

// No DSN, no SDK: the server runs exactly as it did before monitoring existed.
if (config.dsn) {
    init({
        dsn: config.dsn,
        environment: config.environment,
        release: config.release,
        tracesSampleRate: config.tracesSampleRate,
        dataCollection: SENTRY_DATA_COLLECTION,
    });
}
