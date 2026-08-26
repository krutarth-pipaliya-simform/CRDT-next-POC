import { test, expect } from "@playwright/test";
import { rawDb } from "../src/lib/db";
import bcrypt from "bcryptjs";

test.describe("Workspace Management", () => {
    let testUserEmail: string;
    let testUserId: string;
    const testPassword = "password123";

    test.beforeAll(async () => {
        testUserEmail = `ws_admin_${Date.now()}@example.com`;
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        const user = await rawDb.user.create({
            data: {
                name: "Workspace Admin",
                email: testUserEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });
        testUserId = user.id;
    });

    test.afterAll(async () => {
        // Clean up created test user and associated records (cascade)
        if (testUserId) {
            await rawDb.user.deleteMany({
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

    test("FR-5 & FR-6: should create a new workspace, assign Admin role, and display on dashboard", async ({
        page,
    }) => {
        await loginAsTestUser(page);

        // Open Create Workspace modal
        await page
            .getByRole("button", { name: "New Workspace" })
            .first()
            .click();
        await expect(
            page.getByRole("heading", { name: "Create Workspace" }),
        ).toBeVisible();

        const wsName = `Design System Org ${Date.now()}`;
        await page.getByLabel("Workspace Name").fill(wsName);
        await page.getByRole("button", { name: "Create", exact: true }).click();

        // Should redirect away from dashboard to workspace overview
        await expect(page.getByRole("heading", { name: wsName })).toBeVisible({
            timeout: 10000,
        });

        // Return to dashboard and verify the card and ADMIN badge are present
        await page.goto("/dashboard");
        await expect(page.getByText(wsName)).toBeVisible();
        await expect(page.getByText("ADMIN")).toBeVisible();
    });

    test("FR-5: should update workspace name from settings", async ({
        page,
    }) => {
        // Create workspace in DB for isolation
        const ws = await rawDb.workspace.create({
            data: {
                name: `Initial Name ${Date.now()}`,
                members: {
                    create: {
                        userId: testUserId,
                        role: "ADMIN",
                    },
                },
            },
        });

        await loginAsTestUser(page);
        await page.goto(`/${ws.id}/settings`);

        await expect(
            page.getByRole("heading", { name: "General Settings" }),
        ).toBeVisible();

        const updatedName = `Updated Name ${Date.now()}`;
        const nameInput = page.getByLabel("Workspace Name");
        await nameInput.fill("");
        await nameInput.fill(updatedName);
        await page.getByRole("button", { name: "Save Changes" }).click();

        await expect(
            page.getByText("Workspace settings saved successfully."),
        ).toBeVisible();

        // Verify on dashboard
        await page.goto("/dashboard");
        await expect(page.getByText(updatedName)).toBeVisible();
    });

    test("FR-5: should delete workspace from danger zone with confirmation", async ({
        page,
    }) => {
        const wsToDelete = await rawDb.workspace.create({
            data: {
                name: `Workspace To Delete ${Date.now()}`,
                members: {
                    create: {
                        userId: testUserId,
                        role: "ADMIN",
                    },
                },
            },
        });

        await loginAsTestUser(page);
        await page.goto(`/${wsToDelete.id}/settings`);

        // Click delete button
        await page.getByRole("button", { name: "Delete Workspace" }).click();

        // Confirmation warning should appear
        await expect(
            page.getByText("Are you sure? This action is permanent"),
        ).toBeVisible();

        // Confirm deletion
        await page
            .getByRole("button", { name: "Yes, Delete Permanently" })
            .click();

        // Should redirect back to dashboard
        await expect(page).toHaveURL("/dashboard");
        await expect(page.getByText(wsToDelete.name)).not.toBeVisible();
    });

    test("FR-7 & FR-8: should generate 24h invite link, join as Member, and invalidate single-use", async ({
        page,
    }) => {
        // 1. Create workspace with admin
        const ws = await rawDb.workspace.create({
            data: {
                name: `Collab Space ${Date.now()}`,
                members: {
                    create: {
                        userId: testUserId,
                        role: "ADMIN",
                    },
                },
            },
        });

        // 2. Generate invite link as Admin in settings
        await loginAsTestUser(page);
        await page.goto(`/${ws.id}/settings/members`);

        await expect(
            page.getByRole("heading", { name: /Workspace Members/ }),
        ).toBeVisible();

        await page
            .getByRole("button", { name: "Generate Invite Link" })
            .click();

        const shareableInput = page.getByRole("textbox", {
            name: "Shareable Link",
        });
        await expect(shareableInput).toBeVisible();
        const inviteUrl = await shareableInput.inputValue();
        expect(inviteUrl).toContain("/invite/");

        // 3. Create a second user (invitee)
        const inviteeEmail = `invitee_${Date.now()}@example.com`;
        const inviteePassword = "password123";
        const hashedInviteePassword = await bcrypt.hash(inviteePassword, 10);

        const inviteeUser = await rawDb.user.create({
            data: {
                name: "Invited Collab",
                email: inviteeEmail,
                password: hashedInviteePassword,
                emailVerified: new Date(),
            },
        });

        // 4. Log in as invitee in a fresh isolated context and visit invite link
        const inviteeContext = await page.context().browser()!.newContext();
        const inviteePage = await inviteeContext.newPage();

        await inviteePage.goto("/login");
        await inviteePage.getByLabel("Email").fill(inviteeEmail);
        await inviteePage.getByLabel("Password").fill(inviteePassword);
        await inviteePage
            .getByRole("button", { name: "Sign In", exact: true })
            .click();
        await expect(
            inviteePage.getByRole("heading", { name: "Your Workspaces" }),
        ).toBeVisible();

        await inviteePage.goto(inviteUrl);

        await expect(
            inviteePage.getByRole("heading", { name: `Join ${ws.name}` }),
        ).toBeVisible();

        // Accept invitation
        await inviteePage
            .getByRole("button", { name: "Accept Invitation" })
            .click();

        // Should redirect to workspace overview
        await expect(inviteePage).toHaveURL(`/${ws.id}`);

        // Invitee visiting dashboard sees workspace with MEMBER badge
        await inviteePage.goto("/dashboard");
        await expect(inviteePage.getByText(ws.name)).toBeVisible();
        await expect(
            inviteePage.getByText("MEMBER", { exact: true }),
        ).toBeVisible();

        // 5. FR-8: Single-use check - re-visiting the invite URL should display "already used"
        await inviteePage.goto(inviteUrl);
        await expect(
            inviteePage.getByRole("heading", {
                name: "This Invitation Has Already Been Used",
            }),
        ).toBeVisible();

        await inviteeContext.close();

        // Clean up invitee user
        await rawDb.user.deleteMany({
            where: { id: inviteeUser.id },
        });
    });

    test("FR-8: should show expired error for invitations older than 24 hours", async ({
        page,
    }) => {
        const ws = await rawDb.workspace.create({
            data: {
                name: `Expired Invite Workspace ${Date.now()}`,
                members: {
                    create: {
                        userId: testUserId,
                        role: "ADMIN",
                    },
                },
            },
        });

        // Create an expired invitation (expired 2 hours ago)
        const expiredInvitation = await rawDb.workspaceInvitation.create({
            data: {
                workspaceId: ws.id,
                createdById: testUserId,
                expiresAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
            },
        });

        await loginAsTestUser(page);
        await page.goto(`/invite/${expiredInvitation.token}`);

        await expect(
            page.getByRole("heading", { name: "This Invitation Has Expired" }),
        ).toBeVisible();
    });

    test("FR-6: Admin should be able to remove a member from workspace", async ({
        page,
    }) => {
        // Create an invitee user in DB
        const hashedPassword = await bcrypt.hash("password123", 10);
        const inviteeUser = await rawDb.user.create({
            data: {
                name: "Invitee To Remove",
                email: `toremove_${Date.now()}@example.com`,
                password: hashedPassword,
                emailVerified: new Date(),
                role: "MEMBER",
            },
        });

        const ws = await rawDb.workspace.create({
            data: {
                name: `Removal Test Workspace ${Date.now()}`,
                members: {
                    create: [
                        { userId: testUserId, role: "ADMIN" },
                        { userId: inviteeUser.id, role: "MEMBER" },
                    ],
                },
            },
        });

        await loginAsTestUser(page);
        await page.goto(`/${ws.id}/settings/members`);

        // Member should be in the list
        await expect(page.getByText("Invitee To Remove")).toBeVisible();

        // Click Remove button next to the member
        await page
            .getByRole("button", { name: "Remove Invitee To Remove" })
            .click();

        // Click Confirm Remove button
        await page.getByRole("button", { name: "Confirm Remove" }).click();

        // Member should be removed from the list
        await expect(page.getByText("Invitee To Remove")).not.toBeVisible();

        // Clean up user
        await rawDb.user.deleteMany({
            where: { id: inviteeUser.id },
        });
    });

    test("FR-5: should toggle workspace visibility between private and public", async ({
        page,
    }) => {
        const ws = await rawDb.workspace.create({
            data: {
                name: `Visibility Workspace ${Date.now()}`,
                visibility: "PRIVATE",
                members: {
                    create: {
                        userId: testUserId,
                        role: "ADMIN",
                    },
                },
            },
        });

        await loginAsTestUser(page);
        await page.goto(`/${ws.id}/settings`);

        // Select Public visibility option
        await page.getByRole("button", { name: /Public/ }).click();
        await page.getByRole("button", { name: "Save Changes" }).click();

        await expect(
            page.getByText("Workspace settings saved successfully."),
        ).toBeVisible();

        // Verify DB update
        const updated = await rawDb.workspace.findUnique({
            where: { id: ws.id },
        });
        expect(updated?.visibility).toBe("PUBLIC");
    });

    test("should discover public workspaces with search and pagination", async ({
        page,
    }) => {
        // Create 7 public workspaces
        const uniquePrefix = `PubWS_${Date.now()}`;
        const createdWorkspaces = [];

        for (let i = 1; i <= 7; i++) {
            const ws = await rawDb.workspace.create({
                data: {
                    name: `${uniquePrefix} Workspace ${i}`,
                    visibility: "PUBLIC",
                    members: {
                        create: {
                            userId: testUserId,
                            role: "ADMIN",
                        },
                    },
                },
            });
            createdWorkspaces.push(ws);
        }

        await loginAsTestUser(page);
        await page.goto("/dashboard?tab=public");

        // Should display the first page of public workspaces
        await expect(
            page.getByText(`${uniquePrefix} Workspace 7`),
        ).toBeVisible();

        // Search for Workspace 3 specifically
        await page
            .getByRole("searchbox", { name: "Search workspaces" })
            .fill(`${uniquePrefix} Workspace 3`);
        await page.getByRole("button", { name: "Search" }).click();

        await expect(
            page.getByText(`${uniquePrefix} Workspace 3`),
        ).toBeVisible();
        await expect(
            page.getByText(`${uniquePrefix} Workspace 1`),
        ).not.toBeVisible();

        // Navigate back to unfiltered public tab
        await page.goto("/dashboard?tab=public");
        await expect(
            page.getByText(`${uniquePrefix} Workspace 7`),
        ).toBeVisible();

        // Pagination: Should show Next button since there are 7 workspaces (pageSize=6)
        await page.getByRole("link", { name: "Next →" }).click();
        await expect(page).toHaveURL(/page=2/);

        // Clean up created public workspaces
        await rawDb.workspace.deleteMany({
            where: { id: { in: createdWorkspaces.map((w) => w.id) } },
        });
    });

    test("should allow any user to join a public workspace and see it in My Workspaces", async ({
        page,
    }) => {
        const creatorEmail = `public_creator_${Date.now()}@example.com`;
        const hashedPassword = await bcrypt.hash("password123", 10);
        const creator = await rawDb.user.create({
            data: {
                name: "Public Workspace Creator",
                email: creatorEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });

        const publicWsName = `Open Source Community ${Date.now()}`;
        const publicWs = await rawDb.workspace.create({
            data: {
                name: publicWsName,
                visibility: "PUBLIC",
                members: {
                    create: {
                        userId: creator.id,
                        role: "ADMIN",
                    },
                },
            },
        });

        // Test user logs in
        await loginAsTestUser(page);

        // Verify test user does NOT have this workspace in My Workspaces yet
        await page.goto("/dashboard?tab=my");
        await expect(page.getByText(publicWsName)).not.toBeVisible();

        // Navigate to Discover Public tab filtered by the specific workspace name
        await page.goto(
            `/dashboard?tab=public&query=${encodeURIComponent(publicWsName)}`,
        );
        await expect(page.getByText(publicWsName)).toBeVisible();

        // Click "Join Workspace" button
        await page.getByRole("button", { name: "Join Workspace" }).click();

        // Button should transition to "Open Workspace →"
        await expect(
            page.getByRole("link", { name: "Open Workspace →" }),
        ).toBeVisible();

        // Navigate to My Workspaces tab -> public workspace must now be listed!
        await page.goto("/dashboard?tab=my");
        await expect(page.getByText(publicWsName)).toBeVisible();

        // Clean up
        await rawDb.workspace.deleteMany({
            where: { id: publicWs.id },
        });
        await rawDb.user.deleteMany({
            where: { id: creator.id },
        });
    });
});
