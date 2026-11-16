import { requireUserId } from "@/features/auth/lib/session";
import {
    getWorkspaceRole,
    verifyWorkspaceRole,
} from "@/features/workspace/lib/rbac";
import { auth, signInAs, signOutSession } from "@/test/mock-auth";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));
jest.mock("@/features/auth/lib/auth", () =>
    jest.requireActual("@/test/mock-auth"),
);
jest.mock("@/features/auth/lib/session", () => ({
    requireUserId: jest.fn(),
}));
jest.mock("next/navigation", () => ({
    redirect: jest.fn((url: string) => {
        throw new Error(`REDIRECT:${url}`);
    }),
}));

beforeEach(() => {
    resetDb();
    auth.mockReset();
    jest.mocked(requireUserId).mockReset();
});

describe("getWorkspaceRole", () => {
    it("is null for a signed-out caller and never queries", async () => {
        signOutSession();
        await expect(getWorkspaceRole("w1")).resolves.toBeNull();
        expect(db.workspaceMember.findFirst).not.toHaveBeenCalled();
    });

    it("returns the member's explicit role, scoped to this user and workspace", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue({ role: "ADMIN" });
        db.workspace.findUnique.mockResolvedValue({ visibility: "PRIVATE" });

        await expect(getWorkspaceRole("w1")).resolves.toBe("ADMIN");
        expect(db.workspaceMember.findFirst).toHaveBeenCalledWith({
            where: { workspaceId: "w1", userId: "u1" },
        });
    });

    it("lets a non-member see a PUBLIC workspace as a guest", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue(null);
        db.workspace.findUnique.mockResolvedValue({ visibility: "PUBLIC" });
        await expect(getWorkspaceRole("w1")).resolves.toBe("GUEST");
    });

    it("denies a non-member of a PRIVATE or missing workspace", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue(null);
        db.workspace.findUnique.mockResolvedValue({ visibility: "PRIVATE" });
        await expect(getWorkspaceRole("w1")).resolves.toBeNull();

        db.workspace.findUnique.mockResolvedValue(null);
        await expect(getWorkspaceRole("w2")).resolves.toBeNull();
    });

    it("never upgrades an explicit member by workspace visibility", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue({ role: "MEMBER" });
        db.workspace.findUnique.mockResolvedValue({ visibility: "PUBLIC" });
        await expect(getWorkspaceRole("w3")).resolves.toBe("MEMBER");
    });
});

describe("verifyWorkspaceRole", () => {
    it("requires a session, returning to the workspace afterwards", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue({ role: "ADMIN" });
        db.workspace.findUnique.mockResolvedValue({ visibility: "PRIVATE" });

        await expect(verifyWorkspaceRole("w4", ["ADMIN"])).resolves.toBe(
            "ADMIN",
        );
        expect(requireUserId).toHaveBeenCalledWith("/w4");
    });

    it("sends someone with no access to /unauthorized", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue(null);
        db.workspace.findUnique.mockResolvedValue({ visibility: "PRIVATE" });

        await expect(verifyWorkspaceRole("w5", ["ADMIN"])).rejects.toThrow(
            "REDIRECT:/unauthorized",
        );
    });

    it("sends a member lacking the role to the workspace's unauthorized page", async () => {
        signInAs("u1");
        db.workspaceMember.findFirst.mockResolvedValue({ role: "GUEST" });
        db.workspace.findUnique.mockResolvedValue({ visibility: "PRIVATE" });

        await expect(
            verifyWorkspaceRole("w6", ["ADMIN", "MEMBER"]),
        ).rejects.toThrow("REDIRECT:/w6/unauthorized");
    });
});
