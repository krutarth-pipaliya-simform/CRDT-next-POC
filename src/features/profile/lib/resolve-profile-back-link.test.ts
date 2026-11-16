import { resolveProfileBackLink } from "@/features/profile/lib/resolve-profile-back-link";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));
jest.mock("@/features/workspace/lib/rbac", () => ({
    getWorkspaceRole: jest.fn(),
}));

const mockRole = jest.mocked(getWorkspaceRole);
const ALL = {
    href: "/dashboard",
    label: "All workspaces",
    "aria-label": "Back to all workspaces",
};

beforeEach(() => {
    resetDb();
    mockRole.mockReset();
});

describe("resolveProfileBackLink", () => {
    it.each([undefined, "", "/dashboard", "/dashboard?x=1", "/"])(
        "goes to the workspace list for %j without any lookup",
        async (from) => {
            await expect(resolveProfileBackLink(from)).resolves.toEqual(ALL);
            expect(mockRole).not.toHaveBeenCalled();
        },
    );

    it("falls back when the caller lost access since the link was made", async () => {
        mockRole.mockResolvedValue(null);
        await expect(resolveProfileBackLink("/w1/tasks")).resolves.toEqual(ALL);
        expect(db.workspace.findUnique).not.toHaveBeenCalled();
    });

    it("falls back when the workspace no longer exists", async () => {
        mockRole.mockResolvedValue("MEMBER");
        db.workspace.findUnique.mockResolvedValue(null);
        await expect(resolveProfileBackLink("/w1/tasks")).resolves.toEqual(ALL);
    });

    it("names the workspace and section", async () => {
        mockRole.mockResolvedValue("MEMBER");
        db.workspace.findUnique.mockResolvedValue({ name: "Acme" });

        await expect(
            resolveProfileBackLink("/w1/tasks?x=1#top"),
        ).resolves.toEqual({
            href: "/w1/tasks?x=1#top",
            label: "Acme · Tasks",
            "aria-label": "Back to Acme · Tasks",
        });
    });

    it("uses just the workspace name for its overview", async () => {
        mockRole.mockResolvedValue("ADMIN");
        db.workspace.findUnique.mockResolvedValue({ name: "Acme" });

        const link = await resolveProfileBackLink("/w1");
        expect(link.label).toBe("Acme");
        expect(link.href).toBe("/w1");
    });

    it("uses just the workspace name for a path that is no known section", async () => {
        mockRole.mockResolvedValue("MEMBER");
        db.workspace.findUnique.mockResolvedValue({ name: "Acme" });

        const link = await resolveProfileBackLink("/w1/unknown-page");
        expect(link.label).toBe("Acme");
    });

    it("does not offer the settings section to a non-admin", async () => {
        mockRole.mockResolvedValue("MEMBER");
        db.workspace.findUnique.mockResolvedValue({ name: "Acme" });

        const link = await resolveProfileBackLink("/w1/settings");
        expect(link.label).toBe("Acme");

        mockRole.mockResolvedValue("ADMIN");
        const admin = await resolveProfileBackLink("/w1/settings");
        expect(admin.label).toBe("Acme · Settings");
    });
});
