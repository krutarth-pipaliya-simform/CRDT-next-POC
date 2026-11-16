import {
    createDocumentSchema,
    deleteDocumentSchema,
    saveDocumentStateSchema,
    updateDocumentSchema,
} from "@/schemas/document";

describe("document schemas", () => {
    it("defaults the title and trims it on create", () => {
        expect(createDocumentSchema.parse({ workspaceId: "w1" }).title).toBe(
            "Untitled Document",
        );
        expect(
            createDocumentSchema.parse({ workspaceId: "w1", title: "  Notes " })
                .title,
        ).toBe("Notes");
    });

    it("rejects an over-long title", () => {
        expect(
            createDocumentSchema.safeParse({
                workspaceId: "w1",
                title: "x".repeat(101),
            }).success,
        ).toBe(false);
    });

    it("does not allow renaming to a blank title", () => {
        expect(
            updateDocumentSchema.safeParse({
                id: "d1",
                workspaceId: "w1",
                title: "   ",
            }).success,
        ).toBe(false);
    });

    it("requires both ids on update, delete and save", () => {
        expect(
            updateDocumentSchema.safeParse({ id: "d1", title: "T" }).success,
        ).toBe(false);
        expect(
            deleteDocumentSchema.safeParse({ workspaceId: "w1" }).success,
        ).toBe(false);
        expect(
            saveDocumentStateSchema.safeParse({ id: "d1", workspaceId: "w1" })
                .success,
        ).toBe(true);
    });
});
