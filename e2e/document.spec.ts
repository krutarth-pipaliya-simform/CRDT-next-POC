import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

test.describe("Collaborative Document Editor (FR-8, FR-9, FR-10)", () => {
    let testUserEmail: string;
    let testUserId: string;
    let testWorkspaceId: string;
    const testPassword = "password123";

    test.beforeAll(async () => {
        testUserEmail = `doc_tester_${Date.now()}@example.com`;
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        const user = await db.user.create({
            data: {
                name: "Document Tester",
                email: testUserEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });
        testUserId = user.id;

        const workspace = await db.workspace.create({
            data: {
                name: "Document Test Workspace",
                members: {
                    create: {
                        userId: user.id,
                        role: "ADMIN",
                    },
                },
            },
        });
        testWorkspaceId = workspace.id;
    });

    test.afterAll(async () => {
        if (testWorkspaceId) {
            await db.workspace.deleteMany({
                where: { id: testWorkspaceId },
            });
        }
        if (testUserId) {
            await db.user.deleteMany({
                where: { id: testUserId },
            });
        }
    });

    async function loginAsTestUser(page: import("@playwright/test").Page) {
        await page.goto("/login");
        await page.getByLabel("Email").fill(testUserEmail);
        await page.getByLabel("Password").fill(testPassword);
        await page
            .getByRole("button", { name: "Sign In", exact: true })
            .click();
        await expect(
            page.getByRole("heading", { name: "Your Workspaces" }),
        ).toBeVisible({ timeout: 15000 });
    }

    test("should display document list and create a new collaborative document", async ({
        page,
    }) => {
        await loginAsTestUser(page);

        // Navigate to Workspace Documents
        await page.goto(`/${testWorkspaceId}/documents`);
        await expect(
            page.getByRole("heading", { name: "Documents", exact: true }),
        ).toBeVisible({ timeout: 15000 });

        // Click create new document
        await page
            .getByRole("button", { name: "New Document" })
            .or(page.getByRole("button", { name: "Create First Document" }))
            .first()
            .click();
        await expect(
            page.getByRole("heading", { name: "Create New Document" }),
        ).toBeVisible();

        const docTitle = `Sprint Architecture Spec ${Date.now()}`;
        await page.getByLabel("Document Title").fill(docTitle);
        await page.getByRole("button", { name: "Create Document" }).click();

        // Should redirect to document editor page
        await expect(page).toHaveURL(
            new RegExp(`/${testWorkspaceId}/documents/`),
        );
        await expect(
            page.getByRole("textbox", { name: "Document Title" }),
        ).toHaveValue(docTitle);

        // Verify editor toolbar is present
        await expect(
            page.getByRole("toolbar", { name: "Editor formatting toolbar" }),
        ).toBeVisible();

        // Verify save status indicator
        await expect(page.getByRole("status")).toBeVisible();

        // Type inside editor ProseMirror content
        const editorContent = page.locator(".ProseMirror");
        await expect(editorContent).toBeVisible();
        await editorContent.click();
        await page.keyboard.type(
            "This is real-time collaborative rich-text content.",
        );

        // Check that character/word count updates
        await expect(page.getByText(/words/)).toBeVisible();

        // Edit title
        const updatedTitle = `${docTitle} (Updated)`;
        await page
            .getByRole("textbox", { name: "Document Title" })
            .fill(updatedTitle);

        // Click Save button
        const saveButton = page.getByRole("button", {
            name: "Save",
            exact: true,
        });
        if (await saveButton.isVisible()) {
            await saveButton.click();
        }

        // Navigate back to documents list
        await page.goto(`/${testWorkspaceId}/documents`);
        await expect(
            page.getByRole("link", { name: updatedTitle }),
        ).toBeVisible({
            timeout: 15000,
        });
    });
});
