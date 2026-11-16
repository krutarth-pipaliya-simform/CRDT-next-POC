import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

/** A valid 1×1 PNG. */
const PNG_BYTES = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "base64",
);

test.describe("Chat file sharing and read receipts (FR-11)", () => {
    test.describe.configure({ mode: "serial" });

    const testPassword = "password123";
    let adminEmail: string;
    let memberEmail: string;
    let outsiderEmail: string;
    let userIds: string[] = [];
    let workspaceId: string;

    test.beforeAll(async () => {
        const timestamp = Date.now();
        adminEmail = `chatfile_admin_${timestamp}@example.com`;
        memberEmail = `chatfile_member_${timestamp}@example.com`;
        outsiderEmail = `chatfile_outsider_${timestamp}@example.com`;
        const password = await bcrypt.hash(testPassword, 10);

        const [admin, member, outsider] = await Promise.all(
            [
                ["Files Admin", adminEmail],
                ["Files Member", memberEmail],
                ["Files Outsider", outsiderEmail],
            ].map(([name, email]) =>
                db.user.create({
                    data: { name, email, password, emailVerified: new Date() },
                }),
            ),
        );
        userIds = [admin.id, member.id, outsider.id];

        const workspace = await db.workspace.create({
            data: {
                name: "Chat Files Workspace",
                members: {
                    create: [
                        { userId: admin.id, role: "ADMIN" },
                        { userId: member.id, role: "MEMBER" },
                    ],
                },
            },
        });
        workspaceId = workspace.id;
    });

    test.afterAll(async () => {
        if (workspaceId) {
            await db.workspace.deleteMany({ where: { id: workspaceId } });
        }
        if (userIds.length > 0) {
            await db.user.deleteMany({ where: { id: { in: userIds } } });
        }
    });

    async function loginAs(page: Page, email: string) {
        await page.goto("/login");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(testPassword);
        await page
            .getByRole("button", { name: "Sign in", exact: true })
            .click();
        await expect(
            page.getByRole("heading", { name: "Your workspaces" }),
        ).toBeVisible({ timeout: 15000 });
    }

    async function openChat(page: Page) {
        await page.goto(`/${workspaceId}/chat`);
        await expect(page.getByTestId("chat-presence")).toHaveAttribute(
            "data-connection",
            /connected|synced/,
            { timeout: 20000 },
        );
    }

    test("shares a file and an image that survive a reload", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await openChat(page);

        // A document with a caption
        await page.getByTestId("chat-attach-input").setInputFiles({
            name: "release-notes.txt",
            mimeType: "text/plain",
            buffer: Buffer.from("Shipping read receipts and file sharing.\n"),
        });
        await expect(page.getByTestId("chat-pending-attachment")).toContainText(
            "release-notes.txt",
        );
        await page.getByTestId("chat-composer-input").fill("Notes attached");
        await page.getByTestId("chat-send-button").click();

        const fileMessage = page
            .getByTestId("chat-message")
            .filter({ hasText: "Notes attached" });
        await expect(fileMessage).toHaveAttribute(
            "data-delivery-state",
            "sent",
            { timeout: 15000 },
        );
        await expect(
            fileMessage.getByTestId("chat-attachment"),
        ).toHaveAttribute("data-kind", "file");

        // An image with no text at all
        await page.getByTestId("chat-attach-input").setInputFiles({
            name: "pixel.png",
            mimeType: "image/png",
            buffer: PNG_BYTES,
        });
        await page.getByTestId("chat-send-button").click();
        await expect(page.getByTestId("chat-attachment-preview")).toBeVisible({
            timeout: 15000,
        });

        await page.reload();

        const chip = page
            .getByTestId("chat-message")
            .filter({ hasText: "Notes attached" })
            .getByTestId("chat-attachment");
        await expect(chip).toContainText("release-notes.txt");
        await expect(chip).toContainText("41 B");

        const preview = page.getByTestId("chat-attachment-preview");
        await expect(preview).toHaveAttribute("alt", "pixel.png");
        // The preview actually loaded through the authorised route
        await expect
            .poll(() =>
                preview.evaluate((image) =>
                    image instanceof HTMLImageElement ? image.naturalWidth : 0,
                ),
            )
            .toBe(1);

        const href = await chip.getAttribute("href");
        expect(href).toMatch(/^\/api\/uploads\/chat\//);
        const download = await page.request.get(href ?? "");
        expect(download.status()).toBe(200);
        expect(download.headers()["content-disposition"]).toContain(
            "attachment",
        );
        expect(await download.text()).toBe(
            "Shipping read receipts and file sharing.\n",
        );

        const rows = await db.message.findMany({
            where: { workspaceId, attachmentUrl: { not: null } },
            select: { body: true, attachmentName: true, attachmentType: true },
            orderBy: { createdAt: "asc" },
        });
        expect(rows).toEqual([
            {
                body: "Notes attached",
                attachmentName: "release-notes.txt",
                attachmentType: "text/plain",
            },
            {
                body: "",
                attachmentName: "pixel.png",
                attachmentType: "image/png",
            },
        ]);
    });

    test("refuses a disallowed type, an oversized file and a disguised one", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await openChat(page);

        const attachInput = page.getByTestId("chat-attach-input");
        const error = page.getByTestId("chat-attachment-error");

        await attachInput.setInputFiles({
            name: "drawing.svg",
            mimeType: "image/svg+xml",
            buffer: Buffer.from("<svg xmlns='http://www.w3.org/2000/svg'/>"),
        });
        await expect(error).toContainText("can't be shared");
        await expect(page.getByTestId("chat-pending-attachment")).toHaveCount(
            0,
        );

        await attachInput.setInputFiles({
            name: "huge.pdf",
            mimeType: "application/pdf",
            buffer: Buffer.alloc(8 * 1024 * 1024 + 1, 0x25),
        });
        await expect(error).toContainText("up to 8 MB");
        await expect(page.getByTestId("chat-pending-attachment")).toHaveCount(
            0,
        );

        // Allowed by name, but the bytes are not a PNG: only the server can tell
        await attachInput.setInputFiles({
            name: "disguised.png",
            mimeType: "image/png",
            buffer: Buffer.from("#!/bin/sh\necho not an image\n"),
        });
        await expect(error).toHaveCount(0);
        await page.getByTestId("chat-send-button").click();

        await expect(
            page.getByText(/"disguised\.png" is not a valid \.png file/),
        ).toBeVisible({ timeout: 15000 });
        await expect(
            page
                .getByTestId("chat-message")
                .filter({ hasText: "disguised.png" }),
        ).toHaveAttribute("data-delivery-state", "failed");

        const stored = await db.message.count({
            where: { workspaceId, attachmentName: "disguised.png" },
        });
        expect(stored).toBe(0);
    });

    test("serves a chat file only to people who can read the channel", async ({
        browser,
        playwright,
    }) => {
        const row = await db.message.findFirstOrThrow({
            where: { workspaceId, attachmentName: "release-notes.txt" },
            select: { attachmentUrl: true },
        });
        const url = row.attachmentUrl ?? "";

        const outsiderContext = await browser.newContext();
        const memberContext = await browser.newContext();
        try {
            const outsiderPage = await outsiderContext.newPage();
            await loginAs(outsiderPage, outsiderEmail);
            const refused = await outsiderPage.request.get(url);
            expect(refused.status()).toBe(404);
            expect(await refused.text()).not.toContain("Shipping");

            const memberPage = await memberContext.newPage();
            await loginAs(memberPage, memberEmail);
            const allowed = await memberPage.request.get(url);
            expect(allowed.status()).toBe(200);
        } finally {
            await outsiderContext.close();
            await memberContext.close();
        }

        const anonymous = await playwright.request.newContext({
            baseURL: test.info().project.use.baseURL,
        });
        try {
            const response = await anonymous.get(url, { maxRedirects: 0 });
            expect(response.status()).toBe(401);
        } finally {
            await anonymous.dispose();
        }
    });

    test("shows a read receipt to the sender in real time", async ({
        browser,
    }) => {
        const adminContext = await browser.newContext();
        const memberContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        const memberPage = await memberContext.newPage();

        try {
            await loginAs(adminPage, adminEmail);
            await loginAs(memberPage, memberEmail);
            await openChat(adminPage);
            await openChat(memberPage);

            const body = `Did you see this? ${Date.now()}`;
            await adminPage.getByTestId("chat-composer-input").fill(body);
            await adminPage.getByTestId("chat-send-button").click();

            // The member's open, scrolled-to-latest tab counts as reading it
            await expect(memberPage.getByText(body)).toBeVisible({
                timeout: 20000,
            });

            const adminMessage = adminPage
                .getByTestId("chat-message")
                .filter({ hasText: body });
            await expect(
                adminMessage.getByTestId("chat-read-receipt"),
            ).toContainText("Seen by Files Member", { timeout: 20000 });

            // Nobody is shown their own receipt
            await expect(
                memberPage
                    .getByTestId("chat-read-receipt")
                    .filter({ hasText: "Files Member" }),
            ).toHaveCount(0);

            // The cursor is persisted, so the receipt survives a reload
            await adminPage.reload();
            await expect(
                adminPage
                    .getByTestId("chat-message")
                    .filter({ hasText: body })
                    .getByTestId("chat-read-receipt"),
            ).toContainText("Seen by Files Member");
        } finally {
            await adminContext.close();
            await memberContext.close();
        }
    });
});
