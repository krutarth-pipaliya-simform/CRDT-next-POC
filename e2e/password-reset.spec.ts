import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

test.describe("Password reset (FR-3)", () => {
    let email: string;
    let userId: string;
    const oldPassword = "password123";
    const newPassword = "brand-new-pass-456";

    test.beforeEach(async () => {
        email = `reset_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;
        const user = await db.user.create({
            data: {
                name: "Reset User",
                email,
                password: await bcrypt.hash(oldPassword, 10),
                emailVerified: new Date(),
            },
        });
        userId = user.id;
    });

    test.afterEach(async () => {
        await db.verificationToken.deleteMany({
            where: { identifier: `password-reset:${email}` },
        });
        await db.user.deleteMany({ where: { id: userId } });
    });

    async function requestResetLink(page: Page, address: string) {
        await page.goto("/login");
        await page.getByRole("link", { name: "Forgot password?" }).click();
        await expect(
            page.getByRole("heading", { name: "Forgot your password" }),
        ).toBeVisible();
        await page.getByLabel("Email").fill(address);
        await page.getByRole("button", { name: "Send reset link" }).click();
        await expect(
            page.getByText("If an account exists for that email"),
        ).toBeVisible({ timeout: 15000 });
    }

    async function logIn(page: Page, password: string) {
        await page.goto("/login");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(password);
        await page
            .getByRole("button", { name: "Sign in", exact: true })
            .click();
    }

    test("resets the password through the emailed link, once", async ({
        page,
    }) => {
        await requestResetLink(page, email);

        const quickLink = page.getByRole("link", {
            name: "Reset password now",
        });
        const resetUrl = await quickLink.getAttribute("href");
        expect(resetUrl).toMatch(/\/reset-password\?token=[a-f0-9]{64}$/);

        // Only the hash is stored, never the emailed token.
        const rawToken = resetUrl?.split("token=")[1] ?? "";
        const stored = await db.verificationToken.findFirst({
            where: { identifier: `password-reset:${email}` },
        });
        expect(stored?.token).toHaveLength(64);
        expect(stored?.token).not.toBe(rawToken);

        await quickLink.click();
        await expect(
            page.getByRole("heading", { name: "Choose a new password" }),
        ).toBeVisible();

        await page
            .getByLabel("New password", { exact: true })
            .fill(newPassword);
        await page
            .getByLabel("Confirm new password", { exact: true })
            .fill("does-not-match");
        await page.getByRole("button", { name: "Set new password" }).click();
        await expect(page.getByText("Passwords do not match")).toBeVisible();

        // React resets a form after its action runs, so both fields are empty.
        await page
            .getByLabel("New password", { exact: true })
            .fill(newPassword);
        await page
            .getByLabel("Confirm new password", { exact: true })
            .fill(newPassword);
        await page.getByRole("button", { name: "Set new password" }).click();
        await expect(
            page.getByText("Your password has been changed"),
        ).toBeVisible({ timeout: 15000 });

        // The link is spent.
        await page.goto(resetUrl ?? "/reset-password");
        await expect(
            page.getByText(
                "This reset link is invalid or has already been used.",
            ),
        ).toBeVisible();

        await logIn(page, oldPassword);
        await expect(page.getByText("Invalid email or password")).toBeVisible();

        await logIn(page, newPassword);
        await expect(
            page.getByRole("heading", { name: "Your workspaces" }),
        ).toBeVisible({ timeout: 15000 });
    });

    test("answers the same way for an unknown address", async ({ page }) => {
        await requestResetLink(page, `nobody_${Date.now()}@example.com`);
        await expect(
            page.getByRole("link", { name: "Reset password now" }),
        ).toHaveCount(0);
    });

    test("refuses an expired link", async ({ page }) => {
        await requestResetLink(page, email);
        const resetUrl = await page
            .getByRole("link", { name: "Reset password now" })
            .getAttribute("href");

        await db.verificationToken.updateMany({
            where: { identifier: `password-reset:${email}` },
            data: { expires: new Date(Date.now() - 1000) },
        });

        await page.goto(resetUrl ?? "/reset-password");
        await expect(
            page.getByText("This reset link has expired."),
        ).toBeVisible();
        await expect(
            page.getByRole("link", { name: "Request a new link" }),
        ).toBeVisible();
    });
});
