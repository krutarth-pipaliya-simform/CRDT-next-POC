import {
    DEFAULT_TRACES_SAMPLE_RATE,
    readSentryConfig,
    readServerSentryConfig,
    SENTRY_DATA_COLLECTION,
} from "@/lib/sentry-config";

describe("readSentryConfig", () => {
    it("returns safe defaults for an empty input", () => {
        expect(readSentryConfig({})).toEqual({
            dsn: undefined,
            environment: "development",
            release: undefined,
            tracesSampleRate: DEFAULT_TRACES_SAMPLE_RATE,
            replayEnabled: false,
            replayOnErrorSampleRate: 1,
        });
    });

    it("accepts a valid configuration", () => {
        expect(
            readSentryConfig({
                dsn: "https://key@o1.ingest.sentry.io/2",
                environment: " staging ",
                release: "1.2.3",
                tracesSampleRate: "0.5",
                replayEnabled: "true",
                replayOnErrorSampleRate: "0.25",
            }),
        ).toEqual({
            dsn: "https://key@o1.ingest.sentry.io/2",
            environment: "staging",
            release: "1.2.3",
            tracesSampleRate: 0.5,
            replayEnabled: true,
            replayOnErrorSampleRate: 0.25,
        });
    });

    it("treats blank values as unset", () => {
        const config = readSentryConfig({
            dsn: "  ",
            environment: "",
            tracesSampleRate: "",
            replayEnabled: " ",
        });
        expect(config.dsn).toBeUndefined();
        expect(config.environment).toBe("development");
        expect(config.tracesSampleRate).toBe(DEFAULT_TRACES_SAMPLE_RATE);
        expect(config.replayEnabled).toBe(false);
    });

    it("never throws on malformed values and falls back", () => {
        const config = readSentryConfig({
            dsn: "not a url",
            tracesSampleRate: "lots",
            replayEnabled: "yes",
            replayOnErrorSampleRate: "7",
        });
        expect(config.dsn).toBeUndefined();
        expect(config.tracesSampleRate).toBe(DEFAULT_TRACES_SAMPLE_RATE);
        expect(config.replayEnabled).toBe(false);
        expect(config.replayOnErrorSampleRate).toBe(1);
    });

    it("rejects negative and over-one sample rates", () => {
        expect(
            readSentryConfig({ tracesSampleRate: "-1" }).tracesSampleRate,
        ).toBe(DEFAULT_TRACES_SAMPLE_RATE);
        expect(
            readSentryConfig({ tracesSampleRate: "2" }).tracesSampleRate,
        ).toBe(DEFAULT_TRACES_SAMPLE_RATE);
    });
});

describe("readServerSentryConfig", () => {
    const names = [
        "SENTRY_DSN",
        "NEXT_PUBLIC_SENTRY_DSN",
        "SENTRY_ENVIRONMENT",
        "SENTRY_RELEASE",
        "SENTRY_TRACES_SAMPLE_RATE",
        "NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE",
    ];
    afterEach(() => {
        for (const name of names) delete process.env[name];
    });

    it("is off without a DSN", () => {
        expect(readServerSentryConfig().dsn).toBeUndefined();
    });

    it("prefers the private variable over the public one", () => {
        process.env.SENTRY_DSN = "https://a@o1.ingest.sentry.io/1";
        process.env.NEXT_PUBLIC_SENTRY_DSN = "https://b@o1.ingest.sentry.io/2";
        expect(readServerSentryConfig().dsn).toBe(
            "https://a@o1.ingest.sentry.io/1",
        );
    });

    it("falls back to the public variable and reads the other settings", () => {
        process.env.NEXT_PUBLIC_SENTRY_DSN = "https://b@o1.ingest.sentry.io/2";
        process.env.SENTRY_ENVIRONMENT = "qa";
        process.env.SENTRY_RELEASE = "r1";
        process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE = "0.3";
        const config = readServerSentryConfig();
        expect(config.dsn).toBe("https://b@o1.ingest.sentry.io/2");
        expect(config.environment).toBe("qa");
        expect(config.release).toBe("r1");
        expect(config.tracesSampleRate).toBe(0.3);
    });
});

describe("SENTRY_DATA_COLLECTION", () => {
    it("collects nothing personal or bulky", () => {
        expect(SENTRY_DATA_COLLECTION).toMatchObject({
            userInfo: false,
            cookies: false,
            httpHeaders: false,
            httpBodies: [],
            urlQueryParams: false,
            stackFrameVariables: false,
        });
    });
});
