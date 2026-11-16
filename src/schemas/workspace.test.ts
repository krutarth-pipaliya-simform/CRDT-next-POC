import {
    createWorkspaceSchema,
    leaveWorkspaceSchema,
    toWorkspaceRole,
    transferOwnershipSchema,
    updateWorkspaceSchema,
    WORKSPACE_ROLE_LABELS,
    WorkspaceVisibility,
} from "@/schemas/workspace";

describe("workspace schemas", () => {
    it("trims and bounds the workspace name", () => {
        expect(createWorkspaceSchema.parse({ name: "  Team " }).name).toBe(
            "Team",
        );
        expect(createWorkspaceSchema.safeParse({ name: " a " }).success).toBe(
            false,
        );
        expect(
            createWorkspaceSchema.safeParse({ name: "x".repeat(51) }).success,
        ).toBe(false);
    });

    it("defaults visibility to PRIVATE and rejects unknown values", () => {
        expect(updateWorkspaceSchema.parse({ name: "Team" }).visibility).toBe(
            "PRIVATE",
        );
        expect(
            updateWorkspaceSchema.safeParse({
                name: "Team",
                visibility: "OPEN",
            }).success,
        ).toBe(false);
        expect(WorkspaceVisibility.PUBLIC).toBe("PUBLIC");
    });

    it("validates leave and transfer payloads", () => {
        expect(
            leaveWorkspaceSchema.safeParse({ workspaceId: "w" }).success,
        ).toBe(true);
        expect(
            transferOwnershipSchema.safeParse({
                workspaceId: "w",
                targetMemberId: "",
            }).success,
        ).toBe(false);
    });
});

describe("toWorkspaceRole", () => {
    it("narrows known roles and rejects the rest", () => {
        expect(toWorkspaceRole("ADMIN")).toBe("ADMIN");
        expect(toWorkspaceRole("MEMBER")).toBe("MEMBER");
        expect(toWorkspaceRole("GUEST")).toBe("GUEST");
        expect(toWorkspaceRole("OWNER")).toBeNull();
        expect(toWorkspaceRole("admin")).toBeNull();
    });

    it("has a label for every role", () => {
        expect(WORKSPACE_ROLE_LABELS).toEqual({
            ADMIN: "Admin",
            MEMBER: "Member",
            GUEST: "Guest",
        });
    });
});
