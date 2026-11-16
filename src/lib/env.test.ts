const original = { ...process.env };

async function loadEnv() {
    jest.resetModules();
    return (await import("@/lib/env")).env;
}

afterEach(() => {
    process.env = { ...original };
});

describe("env", () => {
    it("parses the required variables and leaves integrations optional", async () => {
        const env = await loadEnv();
        expect(env.DATABASE_URL).toBe(original.DATABASE_URL);
        expect(env.AUTH_SECRET).toBe("test-secret");
        expect(env.STRIPE_SECRET_KEY).toBeUndefined();
        expect(env.CMS_API_URL).toBeUndefined();
    });

    it("fails fast on a missing or malformed required variable", async () => {
        delete process.env.AUTH_SECRET;
        await expect(loadEnv()).rejects.toThrow();

        process.env.AUTH_SECRET = "x";
        process.env.DATABASE_URL = "not a url";
        await expect(loadEnv()).rejects.toThrow();
    });

    it("accepts prisma:// (Accelerate) as well as postgres:// URLs", async () => {
        process.env.DATABASE_URL = "prisma://accelerate.example/?api_key=k";
        const env = await loadEnv();
        expect(env.DATABASE_URL).toMatch(/^prisma:/);
    });

    it("treats blank Sentry variables as unset, not invalid", async () => {
        process.env.SENTRY_DSN = "";
        process.env.SENTRY_ORG = "";
        const env = await loadEnv();
        expect(env.SENTRY_DSN).toBeUndefined();
        expect(env.SENTRY_ORG).toBeUndefined();
    });

    it("rejects a malformed optional URL", async () => {
        process.env.CMS_API_URL = "nope";
        await expect(loadEnv()).rejects.toThrow();
    });
});
