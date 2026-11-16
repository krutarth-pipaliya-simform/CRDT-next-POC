import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Read from default ".env" file.
dotenv.config({ path: path.resolve(__dirname, ".env") });

// Override when port 3000 is taken by something else: `E2E_PORT=3100 npm run test:e2e`.
const PORT = process.env.E2E_PORT ?? "3000";
const BASE_URL = `http://localhost:${PORT}`;

// Fixture CMS (a Strapi v5 look-alike). Override the port with E2E_CMS_PORT.
const CMS_PORT = process.env.E2E_CMS_PORT ?? "4103";
const CMS_FIXTURE_TOKEN = "fixture-token";
const CMS_FIXTURE_REVALIDATE_SECRET = "fixture-revalidate-secret";

export default defineConfig({
    testDir: "./e2e",
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: [["list"], ["html", { open: "never" }]],
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: BASE_URL,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: "on-first-retry",
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],

    /* Run your local dev server before starting the tests */
    webServer: [
        {
            // The collab server also reads PORT, so a custom port goes to Next
            // alone instead of through the environment.
            command:
                PORT === "3000"
                    ? "npm run dev"
                    : `npx concurrently -k "next dev --port ${PORT}" "tsx server/src/index.ts"`,
            url: BASE_URL,
            reuseExistingServer: !process.env.CI,
            // Point the app at the fixture CMS below (it only reads these).
            env: {
                CMS_API_URL: `http://localhost:${CMS_PORT}`,
                CMS_API_TOKEN: CMS_FIXTURE_TOKEN,
                CMS_REVALIDATE_SECRET: CMS_FIXTURE_REVALIDATE_SECRET,
            },
        },
        {
            // Stand-in for Strapi; see e2e/fixtures/cms-server.mjs.
            command: "node e2e/fixtures/cms-server.mjs",
            port: Number(CMS_PORT),
            reuseExistingServer: !process.env.CI,
            env: {
                CMS_FIXTURE_PORT: CMS_PORT,
                CMS_FIXTURE_TOKEN: CMS_FIXTURE_TOKEN,
            },
        },
    ],
});
