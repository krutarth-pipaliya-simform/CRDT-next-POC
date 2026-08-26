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

        // After successful registration, verification email notice is displayed
        await expect(
            page.getByText("Confirmation email sent! Please check your inbox."),
        ).toBeVisible({ timeout: 15000 });
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
