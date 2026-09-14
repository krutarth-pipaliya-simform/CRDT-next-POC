import { expect, test } from "@playwright/test";

import { THEME_STORAGE_KEY } from "@/lib/theme";

test.describe("Dark Mode", () => {
    test("defaults to the operating system preference", async ({ browser }) => {
        const dark = await browser.newContext({ colorScheme: "dark" });
        const darkPage = await dark.newPage();
        await darkPage.goto("/");
        await expect(darkPage.locator("html")).toHaveAttribute(
            "data-theme",
            "dark",
        );
        await dark.close();

        const light = await browser.newContext({ colorScheme: "light" });
        const lightPage = await light.newPage();
        await lightPage.goto("/");
        await expect(lightPage.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );
        await light.close();
    });

    test("switches theme from the header control and persists the choice", async ({
        page,
    }) => {
        await page.goto("/");

        const toggle = page.getByTestId("theme-toggle");
        await expect(toggle).toBeVisible();

        await page.getByTestId("theme-option-dark").click();
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "dark",
        );
        await expect(page.getByTestId("theme-option-dark")).toHaveAttribute(
            "aria-checked",
            "true",
        );

        // Survives a hard reload, which is where a flash would show up.
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "dark",
        );
        await expect(toggle).toHaveAttribute("data-preference", "dark");

        await page.getByTestId("theme-option-light").click();
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );
        await page.reload();
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );
    });

    test("an explicit choice overrides the operating system", async ({
        browser,
    }) => {
        // OS says dark, the user asked for light: the user wins.
        const context = await browser.newContext({ colorScheme: "dark" });
        await context.addInitScript(
            ([key, value]) => window.localStorage.setItem(key, value),
            [THEME_STORAGE_KEY, "light"],
        );
        const page = await context.newPage();
        await page.goto("/");

        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );
        await context.close();
    });

    test("resolves the theme before hydration rather than after", async ({
        page,
        request,
    }) => {
        // Structural guarantee: the init script ships inside <head>, ahead of
        // any body content, so the correct theme is painted on the first frame.
        const html = await (await request.get("/")).text();
        const head = html.slice(0, html.indexOf("<body"));
        expect(head).toContain("data-theme");
        expect(head).toContain(THEME_STORAGE_KEY);

        // Behavioural check: the attribute is already correct on a cold load.
        await page.addInitScript(
            ([key, value]) => window.localStorage.setItem(key, value),
            [THEME_STORAGE_KEY, "dark"],
        );
        await page.goto("/", { waitUntil: "commit" });
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "dark",
        );
    });

    test("follows the system when the preference is set back to system", async ({
        browser,
    }) => {
        const context = await browser.newContext({ colorScheme: "dark" });
        const page = await context.newPage();
        await page.goto("/");

        await page.getByTestId("theme-option-light").click();
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );

        await page.getByTestId("theme-option-system").click();
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "dark",
        );
        await expect(page.getByTestId("theme-toggle")).toHaveAttribute(
            "data-preference",
            "system",
        );

        // A live OS change is picked up without a reload.
        await page.emulateMedia({ colorScheme: "light" });
        await expect(page.locator("html")).toHaveAttribute(
            "data-theme",
            "light",
        );
        await context.close();
    });

    test("exposes the control as an accessible radio group", async ({
        page,
    }) => {
        await page.goto("/");

        const group = page.getByRole("radiogroup", { name: "Colour theme" });
        await expect(group).toBeVisible();
        await expect(group.getByRole("radio")).toHaveCount(3);
        await expect(
            page.getByRole("radio", { name: "Dark theme" }),
        ).toBeVisible();
    });
});
