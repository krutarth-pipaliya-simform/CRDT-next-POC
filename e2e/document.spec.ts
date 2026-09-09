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

    test("should prevent simultaneous editing from multiple sessions and enforce read-only mode with takeover capability", async ({
        browser,
    }) => {
        // Session 1 opens document
        const context1 = await browser.newContext();
        const page1 = await context1.newPage();
        await loginAsTestUser(page1);

        await page1.goto(`/${testWorkspaceId}/documents`);
        await page1
            .getByRole("button", { name: "New Document" })
            .or(page1.getByRole("button", { name: "Create First Document" }))
            .first()
            .click();
        const docTitle = `Multi-Session Lock Test ${Date.now()}`;
        await page1.getByLabel("Document Title").fill(docTitle);
        await page1.getByRole("button", { name: "Create Document" }).click();
        await expect(page1).toHaveURL(
            new RegExp(`/${testWorkspaceId}/documents/`),
        );
        const docUrl = page1.url();

        // Verify Session 1 is editable
        await expect(page1.locator(".ProseMirror")).toHaveAttribute(
            "contenteditable",
            "true",
        );
        await expect(
            page1.getByRole("textbox", { name: "Document Title" }),
        ).toBeEnabled();
        await expect(page1.getByRole("alert")).not.toBeVisible();

        // Session 2 for the SAME user opens the same document
        const context2 = await browser.newContext();
        const page2 = await context2.newPage();
        await loginAsTestUser(page2);
        await page2.goto(docUrl);

        // Session 2 must be switched to read-only mode
        await expect(page2.getByRole("alert")).toBeVisible({
            timeout: 15000,
        });
        await expect(page2.getByText("Read-Only Mode Active")).toBeVisible();
        await expect(page2.locator(".ProseMirror")).toHaveAttribute(
            "contenteditable",
            "false",
        );
        await expect(
            page2.getByRole("textbox", { name: "Document Title" }),
        ).toBeDisabled();
        await expect(page2.getByText("Read-Only")).toBeVisible();

        // Session 2 takes over editing
        await page2.getByRole("button", { name: "Take Over Editing" }).click();

        // Session 2 is now editable
        await expect(page2.locator(".ProseMirror")).toHaveAttribute(
            "contenteditable",
            "true",
        );
        await expect(
            page2.getByRole("textbox", { name: "Document Title" }),
        ).toBeEnabled();
        await expect(page2.getByRole("alert")).not.toBeVisible();

        // Session 1 is now switched to read-only mode
        await expect(page1.getByRole("alert")).toBeVisible({
            timeout: 15000,
        });
        await expect(
            page1.getByText("Editing Session Taken Over"),
        ).toBeVisible();
        await expect(page1.locator(".ProseMirror")).toHaveAttribute(
            "contenteditable",
            "false",
        );

        // Session 2 closes: Session 1 automatically regains edit access
        await page2.close();
        await context2.close();

        await expect(page1.locator(".ProseMirror")).toHaveAttribute(
            "contenteditable",
            "true",
            { timeout: 15000 },
        );
        await expect(
            page1.getByRole("textbox", { name: "Document Title" }),
        ).toBeEnabled();
        await expect(page1.getByRole("alert")).not.toBeVisible();

        await page1.close();
        await context1.close();
    });
});
