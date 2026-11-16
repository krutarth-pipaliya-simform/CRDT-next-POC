import {
    forgotPasswordSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
} from "@/schemas/auth";

const TOKEN = "a".repeat(64);

describe("loginSchema", () => {
    it("accepts a valid login", () => {
        expect(
            loginSchema.safeParse({ email: "a@b.co", password: "x" }).success,
        ).toBe(true);
    });

    it("rejects a malformed email and an empty password", () => {
        const result = loginSchema.safeParse({ email: "nope", password: "" });
        expect(result.success).toBe(false);
        if (!result.success) {
            const fields = result.error.issues.map((i) => i.path[0]);
            expect(fields).toEqual(
                expect.arrayContaining(["email", "password"]),
            );
        }
    });
});

describe("registerSchema", () => {
    it("enforces name and password minimums", () => {
        expect(
            registerSchema.safeParse({
                name: "A",
                email: "a@b.co",
                password: "12345678",
            }).success,
        ).toBe(false);
        expect(
            registerSchema.safeParse({
                name: "Ada",
                email: "a@b.co",
                password: "1234567",
            }).success,
        ).toBe(false);
        expect(
            registerSchema.safeParse({
                name: "Ada",
                email: "a@b.co",
                password: "12345678",
            }).success,
        ).toBe(true);
    });
});

describe("forgotPasswordSchema", () => {
    it("requires a valid email", () => {
        expect(forgotPasswordSchema.safeParse({ email: "x" }).success).toBe(
            false,
        );
        expect(
            forgotPasswordSchema.safeParse({ email: "x@y.zz" }).success,
        ).toBe(true);
    });
});

describe("resetPasswordSchema", () => {
    const valid = {
        token: TOKEN,
        password: "longenough",
        confirmPassword: "longenough",
    };

    it("accepts matching passwords with a 64-char hex token", () => {
        expect(resetPasswordSchema.safeParse(valid).success).toBe(true);
    });

    it.each(["short", "A".repeat(64), "g".repeat(64), `${TOKEN}0`])(
        "rejects the token %j",
        (token) => {
            expect(
                resetPasswordSchema.safeParse({ ...valid, token }).success,
            ).toBe(false);
        },
    );

    it("reports a mismatch on confirmPassword", () => {
        const result = resetPasswordSchema.safeParse({
            ...valid,
            confirmPassword: "different1",
        });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error.issues[0]?.path).toEqual(["confirmPassword"]);
            expect(result.error.issues[0]?.message).toBe(
                "Passwords do not match",
            );
        }
    });
});
