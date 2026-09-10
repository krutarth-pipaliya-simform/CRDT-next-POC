import { expect, test } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

test.describe("Task Management & Kanban Board", () => {
    test.describe.configure({ mode: "serial" });

    let adminEmail: string;
    let adminId: string;
    let guestEmail: string;
    let guestId: string;
    let workspaceId: string;
    const testPassword = "password123";

    test.beforeAll(async () => {
        const timestamp = Date.now();
        adminEmail = `task_admin_${timestamp}@example.com`;
        guestEmail = `task_guest_${timestamp}@example.com`;
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        // 1. Create admin user
        const adminUser = await db.user.create({
            data: {
                name: "Task Admin",
                email: adminEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });
        adminId = adminUser.id;

        // 2. Create guest user
        const guestUser = await db.user.create({
            data: {
                name: "Task Guest",
                email: guestEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });
        guestId = guestUser.id;

        // 3. Create workspace with admin and guest members
        const workspace = await db.workspace.create({
            data: {
                name: "Task Test Workspace",
                members: {
                    create: [
                        {
                            userId: adminId,
                            role: "ADMIN",
                        },
                        {
                            userId: guestId,
                            role: "GUEST",
                        },
                    ],
                },
            },
        });
        workspaceId = workspace.id;
    });

    test.afterAll(async () => {
        if (workspaceId) {
            await db.workspace.deleteMany({
                where: { id: workspaceId },
            });
        }
        if (adminId || guestId) {
            await db.user.deleteMany({
                where: { id: { in: [adminId, guestId] } },
            });
        }
    });

    async function loginAs(
        page: import("@playwright/test").Page,
        email: string,
    ) {
        await page.goto("/login");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(testPassword);
        await page
            .getByRole("button", { name: "Sign In", exact: true })
            .click();
        await expect(
            page.getByRole("heading", { name: "Your Workspaces" }),
        ).toBeVisible({ timeout: 15000 });
    }

    test("should display Kanban board with three columns and empty state", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        await expect(
            page.getByRole("heading", { name: "Task Board" }),
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "To Do" }),
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "In Progress" }),
        ).toBeVisible();
        await expect(page.getByRole("heading", { name: "Done" })).toBeVisible();
        await expect(page.getByText("No tasks on the board yet")).toBeVisible();
    });

    test("should create a new task and display it in the To Do column", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        // Click New Task
        await page.getByRole("button", { name: "+ New Task" }).click();
        const dialog = page.locator("dialog[open]");
        await expect(
            dialog.getByRole("heading", { name: "Create Task" }),
        ).toBeVisible();

        // Fill form
        await dialog.getByLabel("Task Title").fill("Implement Kanban UI");
        await dialog
            .getByLabel("Description")
            .fill("Build columns and cards with dnd-kit.");

        // Submit
        await dialog
            .getByRole("button", { name: "Create Task", exact: true })
            .click();
        await expect(dialog).not.toBeVisible();

        // Verify task appears on the board
        await expect(page.getByText("Implement Kanban UI")).toBeVisible();
        await expect(
            page.getByText("Build columns and cards with dnd-kit."),
        ).toBeVisible();
    });

    test("should cycle task priority on click", async ({ page }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        await expect(page.getByText("Implement Kanban UI")).toBeVisible();

        // Find the priority button on the card (initially MEDIUM)
        const priorityBtn = page.getByRole("button", {
            name: /Current priority:/i,
        });
        await expect(priorityBtn).toBeVisible();
        await expect(priorityBtn).toContainText("Medium");

        // Click to cycle to HIGH
        await priorityBtn.click();
        await expect(priorityBtn).toContainText("High");

        // Click to cycle to URGENT
        await priorityBtn.click();
        await expect(priorityBtn).toContainText("Urgent");
    });

    test("should open task detail dialog, edit fields, and save changes", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        // Click on the task card title to open details
        await page.getByText("Implement Kanban UI").click();
        const dialog = page.locator("dialog[open]");
        await expect(
            dialog.getByRole("heading", { name: "Edit Task" }),
        ).toBeVisible();

        // Edit description
        await dialog
            .getByLabel("Description")
            .fill("Updated description with more test details.");

        // Save
        await dialog.getByRole("button", { name: "Save Changes" }).click();
        await expect(dialog).not.toBeVisible();

        // Verify updated description is visible on card
        await expect(
            page.getByText("Updated description with more test details."),
        ).toBeVisible();
    });

    test("should filter tasks using the search input", async ({ page }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        // Create a second task
        await page.getByRole("button", { name: "+ New Task" }).click();
        const createDialog = page.locator("dialog[open]");
        await createDialog
            .getByLabel("Task Title")
            .fill("Setup Database Backups");
        await createDialog
            .getByRole("button", { name: "Create Task", exact: true })
            .click();
        await expect(createDialog).not.toBeVisible();
        await expect(page.getByText("Setup Database Backups")).toBeVisible();

        // Filter by "Database"
        const searchInput = page.getByLabel("Filter tasks");
        await searchInput.fill("Database");

        const taskCards = page.locator('[data-testid="task-card"]');
        await expect(
            taskCards.filter({ hasText: "Setup Database Backups" }),
        ).toBeVisible();
        await expect(
            taskCards.filter({ hasText: "Implement Kanban UI" }),
        ).not.toBeVisible();

        // Clear filter
        await searchInput.fill("");
        await expect(
            taskCards.filter({ hasText: "Implement Kanban UI" }),
        ).toBeVisible();
        await expect(
            taskCards.filter({ hasText: "Setup Database Backups" }),
        ).toBeVisible();
    });

    test("should drag and drop a task card to another column", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        const card = page.getByRole("article", {
            name: "Task: Implement Kanban UI",
        });
        await expect(card).toBeVisible();

        const inProgressColumn = page.getByTestId("kanban-column-IN_PROGRESS");
        await expect(inProgressColumn).toBeVisible();

        const cardBbox = await card.boundingBox();
        const targetBbox = await inProgressColumn.boundingBox();
        expect(cardBbox).not.toBeNull();
        expect(targetBbox).not.toBeNull();

        if (cardBbox && targetBbox) {
            await page.mouse.move(
                cardBbox.x + cardBbox.width / 2,
                cardBbox.y + cardBbox.height / 2,
            );
            await page.mouse.down();
            await page.mouse.move(
                targetBbox.x + targetBbox.width / 2,
                targetBbox.y + 100,
                { steps: 25 },
            );
            await page.mouse.up();
        }

        // Verify the card is now within the In Progress column
        await expect(
            inProgressColumn.getByText("Implement Kanban UI"),
        ).toBeVisible();
    });

    test("should delete a task from the detail dialog with confirmation", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${workspaceId}/tasks`);

        await page.getByText("Setup Database Backups").click();
        const dialog = page.locator("dialog[open]");
        await expect(
            dialog.getByRole("heading", { name: "Edit Task" }),
        ).toBeVisible();

        // Click Delete button
        await dialog
            .getByRole("button", { name: "Delete", exact: true })
            .click();
        await expect(
            dialog.getByText("Permanently delete this task?"),
        ).toBeVisible();

        // Confirm Delete
        await dialog.getByRole("button", { name: "Confirm Delete" }).click();
        await expect(dialog).not.toBeVisible();

        // Verify task removed from board
        await expect(
            page.getByText("Setup Database Backups"),
        ).not.toBeVisible();
    });

    test("should enforce RBAC: Guest can view board but cannot create, edit, or drag", async ({
        page,
    }) => {
        await loginAs(page, guestEmail);
        await page.goto(`/${workspaceId}/tasks`);

        // Guest can see the board and headings
        await expect(
            page.getByRole("heading", { name: "Task Board" }),
        ).toBeVisible();
        await expect(
            page.getByRole("heading", { name: "To Do" }),
        ).toBeVisible();

        // Guest cannot see "+ New Task" button
        await expect(
            page.getByRole("button", { name: "+ New Task" }),
        ).not.toBeVisible();

        // If a task exists, clicking opens view-only dialog
        const remainingCard = page.getByText("Implement Kanban UI");
        if (await remainingCard.isVisible()) {
            await remainingCard.click();
            await expect(
                page.getByRole("heading", { name: "Task Details" }),
            ).toBeVisible();
            await expect(
                page.getByRole("button", { name: "Save Changes" }),
            ).not.toBeVisible();
            await expect(
                page.getByRole("button", { name: "Delete" }),
            ).not.toBeVisible();
            await page
                .getByRole("button", { name: "Close", exact: true })
                .click();
        }
    });
});
