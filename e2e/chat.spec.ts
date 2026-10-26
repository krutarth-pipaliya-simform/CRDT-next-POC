import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

test.describe("Team Chat, Presence & Notifications (Phase 5)", () => {
    test.describe.configure({ mode: "serial" });

    let adminEmail: string;
    let adminId: string;
    let memberEmail: string;
    let memberId: string;
    let guestEmail: string;
    let guestId: string;
    let workspaceId: string;
    const testPassword = "password123";

    test.beforeAll(async () => {
        const timestamp = Date.now();
        adminEmail = `chat_admin_${timestamp}@example.com`;
        memberEmail = `chat_member_${timestamp}@example.com`;
        guestEmail = `chat_guest_${timestamp}@example.com`;
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        const [admin, member, guest] = await Promise.all([
            db.user.create({
                data: {
                    name: "Chat Admin",
                    email: adminEmail,
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            }),
            db.user.create({
                data: {
                    name: "Chat Member",
                    email: memberEmail,
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            }),
            db.user.create({
                data: {
                    name: "Chat Guest",
                    email: guestEmail,
                    password: hashedPassword,
                    emailVerified: new Date(),
                },
            }),
        ]);

        adminId = admin.id;
        memberId = member.id;
        guestId = guest.id;

        const workspace = await db.workspace.create({
            data: {
                name: "Chat Test Workspace",
                members: {
                    create: [
                        { userId: adminId, role: "ADMIN" },
                        { userId: memberId, role: "MEMBER" },
                        { userId: guestId, role: "GUEST" },
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
        const userIds = [adminId, memberId, guestId].filter(Boolean);
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

    test("renders the channel with presence and an empty history", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/chat`);

        await expect(
            page.getByRole("heading", {
                name: "Everyone in Chat Test Workspace",
                exact: true,
            }),
        ).toBeVisible();
        await expect(page.getByTestId("chat-panel")).toBeVisible();
        await expect(page.getByTestId("chat-presence")).toBeVisible();
        await expect(page.getByText("No messages yet")).toBeVisible();
        await expect(page.getByTestId("chat-composer-input")).toBeEnabled();
    });

    test("sends a message that persists across a reload", async ({ page }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/chat`);

        const composer = page.getByTestId("chat-composer-input");
        await composer.fill("First message from the admin");
        await page.getByTestId("chat-send-button").click();

        const message = page
            .getByTestId("chat-message")
            .filter({ hasText: "First message from the admin" });
        await expect(message).toBeVisible();
        await expect(message).toHaveAttribute("data-delivery-state", "sent", {
            timeout: 15000,
        });

        // Reload to prove the message came back from PostgreSQL, not just local state
        await page.reload();
        await expect(
            page.getByText("First message from the admin"),
        ).toBeVisible();
    });

    test("sends with Enter and keeps Shift+Enter as a newline", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/chat`);

        const composer = page.getByTestId("chat-composer-input");
        await composer.click();
        await composer.type("Line one");
        await composer.press("Shift+Enter");
        await composer.type("Line two");
        await expect(composer).toHaveValue("Line one\nLine two");

        await composer.press("Enter");
        await expect(composer).toHaveValue("");
        await expect(page.getByText("Line one")).toBeVisible();
    });

    test("places a guest in read-only mode without a composer", async ({
        page,
    }) => {
        await loginAs(page, guestEmail);
        await page.goto(`/${workspaceId}/chat`);

        await expect(page.getByTestId("chat-panel")).toBeVisible();
        await expect(page.getByTestId("chat-composer-input")).toHaveCount(0);
        await expect(
            page.getByText(/viewing this workspace as a guest/i),
        ).toBeVisible();
        // History is still readable
        await expect(
            page.getByText("First message from the admin"),
        ).toBeVisible();
    });

    test("broadcasts a message to a second session in real time", async ({
        browser,
    }) => {
        const adminContext = await browser.newContext();
        const memberContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        const memberPage = await memberContext.newPage();

        try {
            await loginAs(adminPage, adminEmail);
            await loginAs(memberPage, memberEmail);

            await adminPage.goto(`/${workspaceId}/chat`);
            await memberPage.goto(`/${workspaceId}/chat`);

            // Both sessions must be attached to the CRDT room before broadcasting
            await expect(
                adminPage.getByTestId("chat-presence"),
            ).toHaveAttribute("data-connection", /connected|synced/, {
                timeout: 20000,
            });
            await expect(
                memberPage.getByTestId("chat-presence"),
            ).toHaveAttribute("data-connection", /connected|synced/, {
                timeout: 20000,
            });

            const broadcastBody = `Realtime ping ${Date.now()}`;
            await adminPage
                .getByTestId("chat-composer-input")
                .fill(broadcastBody);
            await adminPage.getByTestId("chat-send-button").click();

            await expect(memberPage.getByText(broadcastBody)).toBeVisible({
                timeout: 20000,
            });
        } finally {
            await adminContext.close();
            await memberContext.close();
        }
    });

    test("shows a typing indicator in a peer session", async ({ browser }) => {
        const adminContext = await browser.newContext();
        const memberContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        const memberPage = await memberContext.newPage();

        try {
            await loginAs(adminPage, adminEmail);
            await loginAs(memberPage, memberEmail);

            await adminPage.goto(`/${workspaceId}/chat`);
            await memberPage.goto(`/${workspaceId}/chat`);

            await expect(memberPage.getByTestId("chat-presence")).toContainText(
                /here|Just you/,
                { timeout: 20000 },
            );

            await adminPage.getByTestId("chat-composer-input").click();
            await adminPage
                .getByTestId("chat-composer-input")
                .type("Drafting a reply", { delay: 60 });

            await expect(
                memberPage.getByTestId("typing-indicator"),
            ).toContainText(/is typing/i, { timeout: 20000 });
        } finally {
            await adminContext.close();
            await memberContext.close();
        }
    });

    test("notifies a mentioned teammate and lists it in the activity feed", async ({
        browser,
    }) => {
        const adminContext = await browser.newContext();
        const memberContext = await browser.newContext();
        const adminPage = await adminContext.newPage();
        const memberPage = await memberContext.newPage();

        try {
            await loginAs(adminPage, adminEmail);
            await loginAs(memberPage, memberEmail);

            // The member keeps a page open so the SSE stream is live when the mention lands
            await memberPage.goto(`/${workspaceId}/chat`);
            await expect(memberPage.getByTestId("chat-panel")).toBeVisible();

            await adminPage.goto(`/${workspaceId}/chat`);
            await adminPage
                .getByTestId("chat-composer-input")
                .fill("@Chat Member can you review the board?");
            await adminPage.getByTestId("chat-send-button").click();

            // The bell badge appears without a reload, driven by the SSE stream
            await expect(
                memberPage.getByTestId("notification-unread-count"),
            ).toBeVisible({ timeout: 20000 });

            await memberPage.getByTestId("notification-bell").click();
            await expect(
                memberPage.getByTestId("notification-dropdown"),
            ).toContainText(/mentioned you in chat/i);

            await memberPage.goto(`/${workspaceId}/activity`);
            await expect(memberPage.getByTestId("activity-feed")).toContainText(
                /mentioned you in chat/i,
            );
        } finally {
            await adminContext.close();
            await memberContext.close();
        }
    });

    test("notifies the assignee when a task is assigned to them", async ({
        page,
    }) => {
        const memberMembership = await db.workspaceMember.findFirstOrThrow({
            where: { workspaceId, userId: memberId },
            select: { id: true },
        });

        await db.task.create({
            data: {
                title: "Review the release notes",
                workspaceId,
                assigneeId: memberMembership.id,
                position: 1024,
            },
        });

        await db.notification.create({
            data: {
                type: "TASK_ASSIGNED",
                title: 'You were assigned "Review the release notes"',
                href: `/${workspaceId}/tasks`,
                workspaceId,
                recipientId: memberId,
                actorId: adminId,
            },
        });

        await loginAs(page, memberEmail);
        await page.goto(`/${workspaceId}/activity`);

        await expect(page.getByTestId("activity-feed")).toContainText(
            "Review the release notes",
        );

        // Clearing the workspace drops the unread badge
        await page.getByRole("button", { name: "Mark all read" }).click();
        await expect(page.getByTestId("notification-unread-count")).toHaveCount(
            0,
            { timeout: 15000 },
        );
    });
});
