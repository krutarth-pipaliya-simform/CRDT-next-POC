import {
    profileSearchParamsSchema,
    updatePasswordSchema,
    updateProfileSchema,
} from "@/features/profile/schemas";

describe("updateProfileSchema", () => {
    it("allows omitting the name and bounds it otherwise", () => {
        expect(updateProfileSchema.safeParse({}).success).toBe(true);
        expect(updateProfileSchema.safeParse({ name: "A" }).success).toBe(
            false,
        );
        expect(
            updateProfileSchema.safeParse({ name: "x".repeat(51) }).success,
        ).toBe(false);
        expect(updateProfileSchema.safeParse({ name: "Ada" }).success).toBe(
            true,
        );
    });
});

describe("updatePasswordSchema", () => {
    const valid = {
        currentPassword: "old",
        newPassword: "newpassword",
        confirmPassword: "newpassword",
    };

    it("accepts a matching new password", () => {
        expect(updatePasswordSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects a mismatch and a short password", () => {
        const mismatch = updatePasswordSchema.safeParse({
            ...valid,
            confirmPassword: "other-value",
        });
        expect(mismatch.success).toBe(false);
        if (!mismatch.success) {
            expect(mismatch.error.issues[0]?.path).toEqual(["confirmPassword"]);
        }
        expect(
            updatePasswordSchema.safeParse({
                ...valid,
                newPassword: "short",
                confirmPassword: "short",
            }).success,
        ).toBe(false);
    });
});

describe("profileSearchParamsSchema (open-redirect guard)", () => {
    const parse = (from: unknown) =>
        profileSearchParamsSchema.parse({ from }).from;

    it("keeps same-origin paths", () => {
        expect(parse("/dashboard")).toBe("/dashboard");
        expect(parse("/w1/tasks?x=1#top")).toBe("/w1/tasks?x=1#top");
    });

    it.each([
        "//evil.example",
        "/\\evil.example",
        "https://evil.example",
        "javascript:alert(1)",
        "relative/path",
        "/has space",
        "/profile",
        "/profile?x=1",
        "/profile/edit",
        `/${"a".repeat(600)}`,
        42,
    ])("drops %j", (value) => {
        expect(parse(value)).toBeUndefined();
    });

    it("allows paths that merely start with the word profile", () => {
        expect(parse("/profiles")).toBe("/profiles");
    });

    it("is optional", () => {
        expect(profileSearchParamsSchema.parse({}).from).toBeUndefined();
    });
});
