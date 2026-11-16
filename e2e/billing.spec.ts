import { readFile } from "node:fs/promises";

import { expect, test, type Page } from "@playwright/test";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

test.describe("Billing & Analytics Dashboard", () => {
    test.describe.configure({ mode: "serial" });

    let adminEmail: string;
    let adminId: string;
    let memberEmail: string;
    let memberId: string;
    let freeWorkspaceId: string;
    let proWorkspaceId: string;
    let enterpriseWorkspaceId: string;
    let emptyWorkspaceId: string;
    const testPassword = "password123";

    test.beforeAll(async () => {
        const timestamp = Date.now();
        adminEmail = `billing_admin_${timestamp}@example.com`;
        memberEmail = `billing_member_${timestamp}@example.com`;
        const hashedPassword = await bcrypt.hash(testPassword, 10);

        const adminUser = await db.user.create({
            data: {
                name: "Billing Admin",
                email: adminEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });
        adminId = adminUser.id;

        const memberUser = await db.user.create({
            data: {
                name: "Billing Member",
                email: memberEmail,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });
        memberId = memberUser.id;

        // Free workspace, populated so every chart has something to draw.
        const freeWorkspace = await db.workspace.create({
            data: {
                name: "Billing Free Workspace",
                members: {
                    create: [
                        { userId: adminId, role: "ADMIN" },
                        { userId: memberId, role: "MEMBER" },
                    ],
                },
            },
            include: { members: true },
        });
        freeWorkspaceId = freeWorkspace.id;

        const adminMember = freeWorkspace.members.find(
            (member) => member.userId === adminId,
        );

        await db.task.createMany({
            data: [
                {
                    title: "Analytics seed done task",
                    status: "DONE",
                    priority: "HIGH",
                    position: 1024,
                    workspaceId: freeWorkspaceId,
                    assigneeId: adminMember?.id ?? null,
                },
                {
                    title: "Analytics seed in-progress task",
                    status: "IN_PROGRESS",
                    priority: "MEDIUM",
                    position: 2048,
                    workspaceId: freeWorkspaceId,
                    assigneeId: adminMember?.id ?? null,
                },
                {
                    title: "Analytics seed todo task",
                    status: "TODO",
                    priority: "URGENT",
                    position: 3072,
                    workspaceId: freeWorkspaceId,
                },
            ],
        });

        await db.document.create({
            data: {
                title: "Analytics seed document",
                workspaceId: freeWorkspaceId,
            },
        });

        await db.message.create({
            data: {
                body: "Analytics seed message",
                workspaceId: freeWorkspaceId,
                authorId: adminId,
            },
        });

        // Pro workspace: the subscription row is seeded directly, standing in for
        // a completed Stripe checkout so entitlement can be tested without Stripe.
        const proWorkspace = await db.workspace.create({
            data: {
                name: "Billing Pro Workspace",
                members: { create: [{ userId: adminId, role: "ADMIN" }] },
                subscription: {
                    create: {
                        plan: "PRO",
                        status: "ACTIVE",
                        stripeCustomerId: `cus_e2e_${timestamp}`,
                        stripeSubscriptionId: `sub_e2e_${timestamp}`,
                        currentPeriodEnd: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000,
                        ),
                    },
                },
            },
        });
        proWorkspaceId = proWorkspace.id;

        await db.task.create({
            data: {
                title: "Pro workspace task",
                status: "TODO",
                priority: "LOW",
                position: 1024,
                workspaceId: proWorkspaceId,
            },
        });

        const enterpriseWorkspace = await db.workspace.create({
            data: {
                name: "Billing Enterprise Workspace",
                members: { create: [{ userId: adminId, role: "ADMIN" }] },
                subscription: {
                    create: {
                        plan: "ENTERPRISE",
                        status: "ACTIVE",
                        currentPeriodEnd: new Date(
                            Date.now() + 30 * 24 * 60 * 60 * 1000,
                        ),
                    },
                },
                tasks: {
                    create: {
                        title: "Enterprise workspace task",
                        status: "REVIEW",
                        priority: "HIGH",
                        position: 1024,
                    },
                },
            },
        });
        enterpriseWorkspaceId = enterpriseWorkspace.id;

        const emptyWorkspace = await db.workspace.create({
            data: {
                name: "Billing Empty Workspace",
                members: { create: [{ userId: adminId, role: "ADMIN" }] },
            },
        });
        emptyWorkspaceId = emptyWorkspace.id;
    });

    test.afterAll(async () => {
        await db.workspace.deleteMany({
            where: {
                id: {
                    in: [
                        freeWorkspaceId,
                        proWorkspaceId,
                        enterpriseWorkspaceId,
                        emptyWorkspaceId,
                    ],
                },
            },
        });
        await db.user.deleteMany({
            where: { id: { in: [adminId, memberId] } },
        });
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

    test("shows the Free plan and a Pro upgrade path to an admin", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${freeWorkspaceId}/settings/billing`);

        const panel = page.getByTestId("billing-panel");
        await expect(panel).toBeVisible();
        await expect(page.getByTestId("current-plan")).toHaveAttribute(
            "data-plan",
            "FREE",
        );
        await expect(page.getByTestId("plan-card-free")).toBeVisible();
        await expect(page.getByTestId("plan-card-pro")).toBeVisible();
        await expect(page.getByTestId("plan-card-enterprise")).toBeVisible();
        await expect(page.getByTestId("upgrade-button")).toBeVisible();
        // No Stripe customer yet, so there is nothing to manage in the portal.
        await expect(page.getByTestId("manage-billing-button")).toHaveCount(0);
        await expect(page.getByTestId("cancel-plan-button")).toHaveCount(0);

        // FR-21: the history section is there, empty until the first payment.
        await expect(
            page.getByRole("heading", { name: "Billing history" }),
        ).toBeVisible();
        await expect(page.getByTestId("invoice-history")).toContainText(
            "No invoices yet",
        );
        await expect(page.getByTestId("payment-history")).toContainText(
            "No payments yet",
        );
    });

    test("reports an active Pro subscription with a portal entry point", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${proWorkspaceId}/settings/billing`);

        await expect(page.getByTestId("current-plan")).toHaveAttribute(
            "data-plan",
            "PRO",
        );
        await expect(page.getByTestId("manage-billing-button")).toBeVisible();
        await expect(page.getByTestId("upgrade-button")).toHaveCount(0);
        // A paying workspace switches plan and cancels in place.
        await expect(page.getByTestId("cancel-plan-button")).toBeVisible();
        await expect(
            page.getByTestId("plan-card-enterprise").getByRole("button"),
        ).toContainText("Upgrade to Enterprise");

        await page.getByTestId("cancel-plan-button").click();
        const dialog = page.getByRole("dialog", { name: "Cancel Pro" });
        await expect(dialog).toBeVisible();
        await dialog.getByRole("button", { name: "Keep plan" }).click();
        await expect(dialog).toBeHidden();
    });

    test("gives Enterprise a year of analytics history", async ({ page }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${enterpriseWorkspaceId}/analytics`);

        await expect(page.getByTestId("plan-badge")).toHaveAttribute(
            "data-plan",
            "ENTERPRISE",
        );
        await page.getByRole("link", { name: "Last 12 months" }).click();
        await expect(page).toHaveURL(
            `/${enterpriseWorkspaceId}/analytics?range=365d`,
        );
        await expect(page.getByTestId("stat-tasks-created")).toContainText(
            "last 12 months",
        );
    });

    test("keeps billing settings out of reach for a non-admin member", async ({
        page,
    }) => {
        await loginAs(page, memberEmail);
        await page.goto(`/${freeWorkspaceId}/settings/billing`);

        await expect(page).toHaveURL(`/${freeWorkspaceId}/unauthorized`);
        await expect(page.getByText("403 · Restricted Area")).toBeVisible();
    });

    test("renders analytics tiles and every ECharts widget", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${freeWorkspaceId}/analytics`);

        await expect(
            page.getByRole("heading", { name: "Workspace pulse", exact: true }),
        ).toBeVisible();
        await expect(page.getByTestId("analytics-totals")).toBeVisible();
        await expect(page.getByTestId("stat-completion-rate")).toContainText(
            "33.3%",
        );
        await expect(page.getByTestId("stat-documents")).toContainText("1");

        for (const chart of [
            "chart-completion-rate",
            "chart-activity",
            "chart-member-growth",
            "chart-status",
            "chart-priority",
            "chart-contributors",
        ]) {
            await expect(page.getByTestId(chart)).toHaveAttribute(
                "data-chart-ready",
                "true",
                { timeout: 15000 },
            );
        }
    });

    test("exports chart data as CSV and the chart as PNG (FR-18)", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${freeWorkspaceId}/analytics`);
        await expect(page.getByTestId("chart-activity")).toHaveAttribute(
            "data-chart-ready",
            "true",
            { timeout: 15000 },
        );

        const csvDownload = page.waitForEvent("download");
        await page
            .getByRole("button", {
                name: "Download Workspace activity data as CSV",
            })
            .click();
        const csv = await csvDownload;
        expect(csv.suggestedFilename()).toBe("workspace-activity.csv");
        const content = await readFile(await csv.path(), "utf8");
        const [header, ...rows] = content.replace(/^\uFEFF/, "").split("\r\n");
        expect(header).toBe(
            "Date,Tasks created,Tasks completed,Documents,Messages",
        );
        expect(rows).toHaveLength(7);

        // FR-17: two members joined the free workspace in this window.
        const growthCsv = page.waitForEvent("download");
        await page
            .getByRole("button", {
                name: "Download Member growth data as CSV",
            })
            .click();
        const growth = await readFile(await (await growthCsv).path(), "utf8");
        expect(growth.trim().split("\r\n").at(-1)).toMatch(/,2$/);

        const pngDownload = page.waitForEvent("download");
        await page
            .getByRole("button", { name: "Download Member growth as PNG" })
            .click();
        const png = await pngDownload;
        expect(png.suggestedFilename()).toBe("member-growth.png");
        const bytes = await readFile(await png.path());
        expect(bytes.subarray(1, 4).toString()).toBe("PNG");
    });

    test("locks longer history on Free and falls back to 7 days", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${freeWorkspaceId}/analytics`);

        await expect(page.getByTestId("analytics-range-lock")).toBeVisible();
        // Locked ranges render as disabled buttons carrying a "Pro" tag.
        await expect(
            page.getByRole("button", { name: "Last 30 days" }),
        ).toBeDisabled();
        await expect(
            page.getByRole("button", { name: "Last 90 days" }),
        ).toBeDisabled();
        // Each locked range names the cheapest plan that unlocks it.
        const yearRange = page.getByRole("button", { name: /Last 12 months/ });
        await expect(yearRange).toBeDisabled();
        await expect(yearRange).toContainText("Enterprise");

        // A hand-typed range must be refused by the server, not just hidden in the UI.
        await page.goto(`/${freeWorkspaceId}/analytics?range=90d`);
        await expect(page.getByTestId("stat-tasks-created")).toContainText(
            "last 7 days",
        );
        await expect(
            page.getByRole("link", { name: "Last 7 days" }),
        ).toHaveAttribute("aria-current", "page");
    });

    test("unlocks the 90-day range on Pro", async ({ page }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${proWorkspaceId}/analytics`);

        await expect(page.getByTestId("analytics-range-lock")).toHaveCount(0);
        await expect(page.getByTestId("plan-badge")).toHaveAttribute(
            "data-plan",
            "PRO",
        );

        await page.getByRole("link", { name: "Last 90 days" }).click();
        await expect(page).toHaveURL(`/${proWorkspaceId}/analytics?range=90d`);
        await expect(page.getByTestId("stat-tasks-created")).toContainText(
            "last 90 days",
        );
    });

    test("shows an empty state for a workspace with no activity", async ({
        page,
    }) => {
        await loginAs(page, adminEmail);
        await page.goto(`/${emptyWorkspaceId}/analytics`);

        await expect(page.getByText("Nothing to chart yet")).toBeVisible();
        await expect(page.getByTestId("chart-activity")).toHaveCount(0);
    });
});
