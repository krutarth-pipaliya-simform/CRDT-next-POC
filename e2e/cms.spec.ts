import { expect, test } from "@playwright/test";

import {
    CMS_NOT_CONFIGURED_ERROR,
    resolveCmsContext,
} from "../src/features/cms/lib/cms-context";

// Runs against the fixture CMS (e2e/fixtures/cms-server.mjs), which the
// Playwright config starts and points the app at. Every test is signed out.

const REVALIDATE_SECRET = "fixture-revalidate-secret";

test.describe("CMS content (signed out)", () => {
    test("blog lists published articles, newest first, with pagination", async ({
        page,
    }) => {
        await page.goto("/blog");
        await expect(page).toHaveURL(/\/blog$/);
        await expect(
            page.getByRole("heading", { name: "Notes from the team" }),
        ).toBeVisible();

        // Page size is 6; article 8 is newest and the draft is never listed.
        const cards = page.getByRole("heading", { level: 2 });
        await expect(cards).toHaveCount(6);
        await expect(cards.first()).toHaveText("Fixture article 8");
        await expect(page.getByText("Unpublished draft")).toHaveCount(0);

        await page.getByRole("link", { name: "Older" }).click();
        await expect(page).toHaveURL(/\/blog\?page=2$/);
        await expect(page.getByRole("heading", { level: 2 })).toHaveCount(2);
        await expect(
            page.getByRole("heading", { name: "Fixture article 1" }),
        ).toBeVisible();
    });

    test("an article renders rich text safely and sets metadata", async ({
        page,
    }) => {
        await page.goto("/blog/fixture-article-8");

        await expect(page).toHaveTitle("Fixture article 8 · Converge");
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            "content",
            "Excerpt for fixture article 8.",
        );
        await expect(
            page.getByRole("heading", { level: 1, name: "Fixture article 8" }),
        ).toBeVisible();

        const article = page.locator("article");
        await expect(
            article.getByRole("heading", { name: "Why merging beats locking" }),
        ).toBeVisible();
        await expect(article.locator("strong")).toHaveText("merged");
        await expect(article.locator("em")).toHaveText("blocked");
        await expect(article.getByRole("listitem")).toHaveCount(2);
        await expect(article.locator("blockquote")).toHaveText(
            "Nothing gets lost.",
        );
        await expect(article.locator("pre code")).toHaveText(
            "const doc = new Y.Doc();",
        );
        await expect(
            article.getByRole("link", { name: "the CRDT primer" }),
        ).toHaveAttribute("href", "https://example.com/crdt");

        // A javascript: link from the CMS is rendered as plain text.
        await expect(article.getByText("unsafe link label")).toBeVisible();
        await expect(article.locator('a[href^="javascript:"]')).toHaveCount(0);
    });

    test("an unknown slug renders the not-found page", async ({ page }) => {
        await page.goto("/blog/does-not-exist");
        await expect(
            page.getByRole("heading", { name: "Nothing here" }),
        ).toBeVisible();
        await expect(page.getByText("404 · Not found")).toBeVisible();

        await page.goto("/docs/does-not-exist");
        await expect(
            page.getByRole("heading", { name: "Nothing here" }),
        ).toBeVisible();
    });

    test("an unpublished draft is not reachable by slug", async ({ page }) => {
        await page.goto("/blog/unpublished-draft");
        await expect(
            page.getByRole("heading", { name: "Nothing here" }),
        ).toBeVisible();
    });

    test("docs are grouped by section in order, and a page opens", async ({
        page,
    }) => {
        await page.goto("/docs");
        const sections = page.getByRole("heading", { level: 2 });
        await expect(sections).toHaveText(["Getting started", "Guides"]);

        await page.getByRole("link", { name: "Using boards" }).click();
        await expect(page).toHaveURL(/\/docs\/using-boards$/);
        await expect(
            page.getByRole("heading", { level: 1, name: "Using boards" }),
        ).toBeVisible();
        await expect(
            page.getByText("Documentation body for Using boards."),
        ).toBeVisible();
        await page.getByRole("link", { name: "Documentation" }).first().click();
        await expect(page).toHaveURL(/\/docs$/);
    });

    test("the changelog lists releases newest first and paginates", async ({
        page,
    }) => {
        await page.goto("/changelog");
        const releases = page.getByRole("heading", { level: 2 });
        await expect(releases).toHaveCount(5);
        await expect(releases.first()).toHaveText("Fixture release 6");
        await expect(page.getByText("v1.6.0")).toBeVisible();

        await page.getByRole("link", { name: "Older" }).click();
        await expect(page.getByRole("heading", { level: 2 })).toHaveCount(1);
        await expect(
            page.getByRole("heading", { name: "Fixture release 1" }),
        ).toBeVisible();
    });

    test("announcements list, and the landing page shows the latest", async ({
        page,
    }) => {
        await page.goto("/announcements");
        await expect(
            page.getByRole("heading", {
                name: "Fixture announcement: Boards got faster",
            }),
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: "See the changelog" }),
        ).toHaveAttribute("href", "/changelog");

        await page.goto("/");
        const strip = page.getByTestId("latest-announcement");
        await expect(strip).toContainText(
            "Fixture announcement: Boards got faster",
        );
        await strip.getByRole("link").click();
        await expect(page).toHaveURL(/\/announcements$/);
    });

    test("the section tabs move between content areas", async ({ page }) => {
        await page.goto("/blog");
        const tabs = page.getByRole("navigation", {
            name: "Content sections",
        });
        await expect(tabs.getByRole("link", { name: "Blog" })).toHaveAttribute(
            "aria-current",
            "page",
        );
        await tabs.getByRole("link", { name: "Changelog" }).click();
        await expect(page).toHaveURL(/\/changelog$/);
    });
});

test.describe("CMS revalidation webhook", () => {
    test("rejects a missing or wrong secret without redirecting to login", async ({
        request,
    }) => {
        const none = await request.post("/api/cms/revalidate", {
            maxRedirects: 0,
        });
        expect(none.status()).toBe(401);

        const wrong = await request.post("/api/cms/revalidate", {
            headers: { authorization: "Bearer nope" },
            maxRedirects: 0,
        });
        expect(wrong.status()).toBe(401);
    });

    test("accepts the shared secret", async ({ request }) => {
        const viaBearer = await request.post("/api/cms/revalidate", {
            headers: { authorization: `Bearer ${REVALIDATE_SECRET}` },
            maxRedirects: 0,
        });
        expect(viaBearer.status()).toBe(200);
        expect(await viaBearer.json()).toEqual({ revalidated: true });

        const viaHeader = await request.post("/api/cms/revalidate", {
            headers: { "x-cms-secret": REVALIDATE_SECRET },
            maxRedirects: 0,
        });
        expect(viaHeader.status()).toBe(200);
    });
});

test.describe("CMS configuration", () => {
    test("the context is unavailable unless URL and token are both set", () => {
        for (const [url, token] of [
            [undefined, undefined],
            ["http://localhost:1337", undefined],
            [undefined, "token"],
        ] as const) {
            expect(resolveCmsContext(url, token)).toEqual({
                success: false,
                error: CMS_NOT_CONFIGURED_ERROR,
            });
        }

        expect(resolveCmsContext("http://localhost:1337///", "token")).toEqual({
            success: true,
            data: { baseUrl: "http://localhost:1337", token: "token" },
        });
    });
});
