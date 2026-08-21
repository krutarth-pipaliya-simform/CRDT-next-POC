import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("should allow a user to register and auto-login", async ({ page }) => {
        const uniqueEmail = `user_${Date.now()}@example.com`;

        await page.goto("/register");

        await expect(
            page.getByRole("heading", { name: "Sign Up" }),
        ).toBeVisible();

        await page.getByLabel("Name").fill("Test User");
        await page.getByLabel("Email").fill(uniqueEmail);
        await page.getByLabel("Password").fill("password123");

        await page
            .getByRole("button", { name: "Sign Up", exact: true })
            .click();

        // After successful registration, it redirects to the dashboard (/)
        await page.waitForURL("/");

        // Let's verify we are on the homepage
        // Wait for auth session to be available, maybe check for some text
        // Or at least check we left the register page
        expect(page.url()).toBe("http://localhost:3000/");
    });

    test("should show error for invalid login", async ({ page }) => {
        await page.goto("/login");

        await page.getByLabel("Email").fill("wrong@example.com");
        await page.getByLabel("Password").fill("wrongpassword");

        await page
            .getByRole("button", { name: "Sign In", exact: true })
            .click();

        // Should display the invalid credentials error
        await expect(page.getByText("Invalid email or password")).toBeVisible();
    });
});
