import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

test.describe("Create workspace: failures explain themselves", () => {
    let email: string;
    let userId: string;
    const password = "password123";

    test.beforeEach(async () => {
        email = `create_errors_${Date.now()}_${Math.random().toString(36).slice(2, 7)}@example.com`;
        const user = await db.user.create({
            data: {
                name: "Create Errors",
                email,
                password: await bcrypt.hash(password, 10),
                emailVerified: new Date(),
            },
        });
        userId = user.id;
    });

    test.afterEach(async () => {
        await db.workspace.deleteMany({
            where: { members: { some: { userId } } },
        });
        await db.user.deleteMany({ where: { id: userId } });
    });

    async function openCreateDialog(page: Page) {
        await page.goto("/login");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(password);
        await page
            .getByRole("button", { name: "Sign in", exact: true })
            .click();
        await expect(
            page.getByRole("heading", { name: "Your workspaces" }),
        ).toBeVisible({ timeout: 15000 });
        await page
            .getByRole("button", { name: "New Workspace" })
            .first()
            .click();
        return page.getByRole("dialog", { name: "Create Workspace" });
    }

    test("keeps the name and focus when the name is too short", async ({
        page,
    }) => {
        const dialog = await openCreateDialog(page);
        const name = dialog.getByLabel("Workspace Name");
        await name.fill("Q");
        await name.press("Enter");

        await expect(
            dialog.getByText("Name must be at least 2 characters"),
        ).toBeVisible();
        await expect(name).toHaveValue("Q");
        await expect(name).toBeFocused();
    });

    test("says the session ended when the account is gone", async ({
        page,
    }) => {
        const dialog = await openCreateDialog(page);
        await dialog.getByLabel("Workspace Name").fill("After deletion");

        // The account disappears while the dialog is open.
        await db.user.delete({ where: { id: userId } });

        await dialog.getByRole("button", { name: "Create" }).click();

        const error = dialog.getByTestId("create-workspace-error");
        await expect(error).toContainText("Your session has ended");
        await expect(dialog.getByLabel("Workspace Name")).toHaveValue(
            "After deletion",
        );

        await error.getByRole("link", { name: "Log in" }).click();
        await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fdashboard$/);
    });
});
