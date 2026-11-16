import { expect, test, type Locator, type Page } from "@playwright/test";
import type { TaskStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

/**
 * Drag-and-drop on the board: the target is the column under most of the
 * card, the preview shows where it will land, and the drop lands there.
 */
test.describe("Kanban drag and drop", () => {
    test.describe.configure({ mode: "serial" });
    test.use({ viewport: { width: 1440, height: 1400 } });

    let email: string;
    let userId: string;
    let workspaceId: string;
    const password = "password123";

    test.beforeAll(async () => {
        email = `task_dnd_${Date.now()}@example.com`;
        const user = await db.user.create({
            data: {
                name: "Dnd Admin",
                email,
                password: await bcrypt.hash(password, 10),
                emailVerified: new Date(),
            },
        });
        userId = user.id;

        const workspace = await db.workspace.create({
            data: {
                name: "Drag Test Workspace",
                members: { create: [{ userId, role: "ADMIN" }] },
            },
        });
        workspaceId = workspace.id;

        const seed: [string, TaskStatus][] = [
            ["T1", "TODO"],
            ["T2", "TODO"],
            ["T3", "TODO"],
            ["T4", "TODO"],
            ["P1", "IN_PROGRESS"],
            ["P2", "IN_PROGRESS"],
            ["P3", "IN_PROGRESS"],
        ];
        await db.task.createMany({
            data: seed.map(([title, status], i) => ({
                title,
                status,
                position: (i + 1) * 1024,
                workspaceId,
            })),
        });
    });

    test.afterAll(async () => {
        if (workspaceId) {
            await db.workspace.deleteMany({ where: { id: workspaceId } });
        }
        if (userId) {
            await db.user.deleteMany({ where: { id: userId } });
        }
    });

    async function openBoard(page: Page) {
        await page.goto("/login");
        await page.getByLabel("Email").fill(email);
        await page.getByLabel("Password").fill(password);
        await page
            .getByRole("button", { name: "Sign in", exact: true })
            .click();
        await expect(
            page.getByRole("heading", { name: "Your workspaces" }),
        ).toBeVisible({ timeout: 15000 });
        await page.goto(`/${workspaceId}/tasks`);
        await expect(
            page.getByRole("heading", { name: "The Board", exact: true }),
        ).toBeVisible();
    }

    const column = (page: Page, status: TaskStatus) =>
        page.getByTestId(`kanban-column-${status}`);
    const card = (page: Page, title: string) =>
        page
            .locator('[data-testid^="kanban-column-"]')
            .getByRole("article", { name: `Task: ${title}` });

    /** Card titles in a column, top to bottom as drawn (ghost included). */
    async function drawnOrder(target: Locator) {
        return target.getByTestId("task-card").evaluateAll((cards) =>
            cards
                .map((c) => ({
                    title: c.querySelector("h3")?.textContent ?? "",
                    top: c.getBoundingClientRect().top,
                }))
                .sort((a, b) => a.top - b.top)
                .map((c) => c.title),
        );
    }

    async function storedOrder(status: TaskStatus) {
        const tasks = await db.task.findMany({
            where: { workspaceId, status },
            orderBy: { position: "asc" },
            select: { title: true },
        });
        return tasks.map((t) => t.title);
    }

    /** Presses on a card at `grabFraction` of its height and moves so the
     *  card's centre ends at (x, y). Leaves the mouse button down. */
    async function dragCardCentreTo(
        page: Page,
        title: string,
        grabFraction: number,
        x: number,
        y: number,
    ) {
        const box = await card(page, title).boundingBox();
        if (!box) throw new Error(`No box for ${title}`);
        const grabX = box.x + box.width / 2;
        const grabY = box.y + box.height * grabFraction;
        await page.mouse.move(grabX, grabY);
        await page.mouse.down();
        await page.mouse.move(grabX + 10, grabY + 10, { steps: 3 });
        await page.mouse.move(x, y + box.height * (grabFraction - 0.5), {
            steps: 20,
        });
    }

    test("previews a cross-column move at the drop point and lands there", async ({
        page,
    }) => {
        await openBoard(page);
        const p1 = await card(page, "P1").boundingBox();
        const p2 = await card(page, "P2").boundingBox();
        if (!p1 || !p2) throw new Error("Missing card boxes");

        await dragCardCentreTo(
            page,
            "T1",
            0.5,
            p1.x + p1.width / 2,
            (p1.y + p1.height + p2.y) / 2 + 5,
        );

        // The target column is outlined and its ghost sits between P1 and P2;
        // the source column has closed up.
        await expect(column(page, "IN_PROGRESS")).toHaveClass(/ring-inset/);
        await expect
            .poll(() => drawnOrder(column(page, "IN_PROGRESS")))
            .toEqual(["P1", "T1", "P2", "P3"]);
        expect(await drawnOrder(column(page, "TODO"))).toEqual([
            "T2",
            "T3",
            "T4",
        ]);

        await page.mouse.up();
        await expect
            .poll(() => storedOrder("IN_PROGRESS"))
            .toEqual(["P1", "T1", "P2", "P3"]);
    });

    test("lands a same-column move where the preview showed it", async ({
        page,
    }) => {
        await openBoard(page);
        const t4 = await card(page, "T4").boundingBox();
        if (!t4) throw new Error("Missing card box");

        await dragCardCentreTo(
            page,
            "T2",
            0.5,
            t4.x + t4.width / 2,
            t4.y + t4.height * 0.75,
        );
        await expect
            .poll(() => drawnOrder(column(page, "TODO")))
            .not.toEqual(["T2", "T3", "T4"]);
        const preview = await drawnOrder(column(page, "TODO"));

        await page.mouse.up();
        await expect.poll(() => storedOrder("TODO")).toEqual(preview);
    });

    test("picks the column under most of the card, wherever it was grabbed", async ({
        page,
    }) => {
        await openBoard(page);
        const p3 = await card(page, "P3").boundingBox();
        const done = await column(page, "DONE").boundingBox();
        if (!p3 || !done) throw new Error("Missing boxes");

        // Grabbed near its bottom edge, the card ends about 65% over Done.
        await dragCardCentreTo(
            page,
            "P3",
            0.9,
            done.x - p3.width * 0.35 + p3.width / 2,
            p3.y + p3.height / 2,
        );
        await expect(column(page, "DONE")).toHaveClass(/ring-inset/);

        await page.mouse.up();
        await expect.poll(() => storedOrder("DONE")).toEqual(["P3"]);
    });

    test("leaves a card in place when a drag ends on its own slot", async ({
        page,
    }) => {
        await openBoard(page);
        const before = await storedOrder("TODO");
        const box = await card(page, "T3").boundingBox();
        if (!box) throw new Error("Missing card box");

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down();
        await page.mouse.move(
            box.x + box.width / 2 + 30,
            box.y + box.height / 2 + 8,
            { steps: 10 },
        );
        await page.mouse.up();

        await page.waitForTimeout(1000);
        expect(await storedOrder("TODO")).toEqual(before);
    });

    test("moves a card between columns with the keyboard", async ({ page }) => {
        await openBoard(page);
        await card(page, "T3").focus();
        await page.keyboard.press("Space");
        // The sensor listens for arrows from the next tick; wait for pickup.
        await expect(column(page, "TODO")).toHaveClass(/ring-inset/);
        await page.keyboard.press("ArrowRight");
        await expect(column(page, "IN_PROGRESS")).toHaveClass(/ring-inset/);
        await page.keyboard.press("Space");

        await expect.poll(() => storedOrder("IN_PROGRESS")).toContain("T3");
        await expect(page.locator("dialog[open]")).toHaveCount(0);

        // Enter opens the task rather than picking it up.
        await card(page, "T4").focus();
        await page.keyboard.press("Enter");
        await expect(page.locator("dialog[open]")).toHaveCount(1);
    });
});
