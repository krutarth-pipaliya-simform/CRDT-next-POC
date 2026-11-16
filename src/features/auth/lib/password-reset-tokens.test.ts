import crypto from "crypto";

import {
    consumePasswordResetToken,
    createPasswordResetToken,
    getPasswordResetTokenStatus,
} from "@/features/auth/lib/password-reset-tokens";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));

const sha256 = (value: string) =>
    crypto.createHash("sha256").update(value).digest("hex");

const HOUR = 60 * 60 * 1000;

beforeEach(() => {
    resetDb();
});

describe("createPasswordResetToken", () => {
    it("emails a random token but stores only its SHA-256, namespaced", async () => {
        db.verificationToken.findFirst.mockResolvedValue(null);
        db.$transaction.mockResolvedValue([]);

        const result = await createPasswordResetToken("a@b.co");

        expect(result.status).toBe("created");
        if (result.status !== "created") return;
        expect(result.token).toMatch(/^[a-f0-9]{64}$/);

        const created = db.verificationToken.create.mock.calls[0]?.[0];
        expect(created.data.identifier).toBe("password-reset:a@b.co");
        expect(created.data.token).toBe(sha256(result.token));
        expect(created.data.token).not.toBe(result.token);
        expect(created.data.expires.getTime()).toBeGreaterThan(
            Date.now() + HOUR - 5_000,
        );
        // The previous token is replaced in the same transaction.
        expect(db.verificationToken.deleteMany).toHaveBeenCalledWith({
            where: { identifier: "password-reset:a@b.co" },
        });
    });

    it("answers cooldown when a token was issued in the last minute", async () => {
        // Issued 10 seconds ago: expires = issuedAt + 1h.
        db.verificationToken.findFirst.mockResolvedValue({
            identifier: "password-reset:a@b.co",
            token: "x",
            expires: new Date(Date.now() - 10_000 + HOUR),
        });

        await expect(createPasswordResetToken("a@b.co")).resolves.toEqual({
            status: "cooldown",
        });
        expect(db.$transaction).not.toHaveBeenCalled();
    });

    it("issues a new token once the cooldown has passed", async () => {
        db.verificationToken.findFirst.mockResolvedValue({
            identifier: "password-reset:a@b.co",
            token: "x",
            expires: new Date(Date.now() - 5 * 60_000 + HOUR),
        });
        db.$transaction.mockResolvedValue([]);

        const result = await createPasswordResetToken("a@b.co");
        expect(result.status).toBe("created");
    });
});

describe("getPasswordResetTokenStatus", () => {
    it("looks the token up by its hash", async () => {
        db.verificationToken.findUnique.mockResolvedValue(null);
        await getPasswordResetTokenStatus("raw");
        expect(db.verificationToken.findUnique).toHaveBeenCalledWith({
            where: { token: sha256("raw") },
        });
    });

    it("is invalid for an unknown token", async () => {
        db.verificationToken.findUnique.mockResolvedValue(null);
        await expect(getPasswordResetTokenStatus("raw")).resolves.toBe(
            "invalid",
        );
    });

    it("never accepts an email-verification token as a reset token", async () => {
        db.verificationToken.findUnique.mockResolvedValue({
            identifier: "a@b.co",
            token: sha256("raw"),
            expires: new Date(Date.now() + HOUR),
        });
        await expect(getPasswordResetTokenStatus("raw")).resolves.toBe(
            "invalid",
        );
    });

    it("distinguishes expired from valid", async () => {
        db.verificationToken.findUnique.mockResolvedValueOnce({
            identifier: "password-reset:a@b.co",
            token: "h",
            expires: new Date(Date.now() - 1),
        });
        await expect(getPasswordResetTokenStatus("raw")).resolves.toBe(
            "expired",
        );

        db.verificationToken.findUnique.mockResolvedValueOnce({
            identifier: "password-reset:a@b.co",
            token: "h",
            expires: new Date(Date.now() + HOUR),
        });
        await expect(getPasswordResetTokenStatus("raw")).resolves.toBe("valid");
    });
});

describe("consumePasswordResetToken", () => {
    const INVALID = "This reset link is invalid or has already been used.";

    beforeEach(() => {
        // Run the transaction callback against the same mock client.
        db.$transaction.mockImplementation(
            async (run: (tx: typeof db) => Promise<unknown>) => run(db),
        );
    });

    function record(overrides: { identifier?: string; expires?: Date } = {}) {
        db.verificationToken.findUnique.mockResolvedValue({
            identifier: "password-reset:a@b.co",
            token: sha256("raw"),
            expires: new Date(Date.now() + HOUR),
            ...overrides,
        });
    }

    it("rejects an unknown token and writes nothing", async () => {
        db.verificationToken.findUnique.mockResolvedValue(null);
        await expect(consumePasswordResetToken("raw", "hash")).resolves.toEqual(
            { success: false, error: INVALID },
        );
        expect(db.user.update).not.toHaveBeenCalled();
    });

    it("rejects a verification token used as a reset token", async () => {
        record({ identifier: "a@b.co" });
        await expect(consumePasswordResetToken("raw", "hash")).resolves.toEqual(
            { success: false, error: INVALID },
        );
        expect(db.user.update).not.toHaveBeenCalled();
    });

    it("deletes an expired token and reports expiry", async () => {
        record({ expires: new Date(Date.now() - 1) });
        const result = await consumePasswordResetToken("raw", "hash");

        expect(result.success).toBe(false);
        if (!result.success) expect(result.error).toMatch(/expired/);
        expect(db.verificationToken.deleteMany).toHaveBeenCalledWith({
            where: { token: sha256("raw") },
        });
        expect(db.user.update).not.toHaveBeenCalled();
    });

    it("loses the race when another redemption already claimed the token", async () => {
        record();
        db.verificationToken.deleteMany.mockResolvedValue({ count: 0 });

        await expect(consumePasswordResetToken("raw", "hash")).resolves.toEqual(
            { success: false, error: INVALID },
        );
        expect(db.user.update).not.toHaveBeenCalled();
    });

    it("fails when the account no longer exists", async () => {
        record();
        db.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
        db.user.findUnique.mockResolvedValue(null);

        await expect(consumePasswordResetToken("raw", "hash")).resolves.toEqual(
            { success: false, error: INVALID },
        );
    });

    it("sets the password, verifies the email and revokes sibling tokens", async () => {
        record();
        db.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
        db.user.findUnique.mockResolvedValue({
            id: "u1",
            emailVerified: null,
        });

        await expect(
            consumePasswordResetToken("raw", "new-hash"),
        ).resolves.toEqual({ success: true });

        expect(db.user.findUnique).toHaveBeenCalledWith({
            where: { email: "a@b.co" },
        });
        const update = db.user.update.mock.calls[0]?.[0];
        expect(update.where).toEqual({ id: "u1" });
        expect(update.data.password).toBe("new-hash");
        expect(update.data.emailVerified).toBeInstanceOf(Date);
        expect(db.verificationToken.deleteMany).toHaveBeenLastCalledWith({
            where: { identifier: "password-reset:a@b.co" },
        });
    });

    it("keeps an already-verified email date", async () => {
        const verifiedAt = new Date("2025-01-01T00:00:00Z");
        record();
        db.verificationToken.deleteMany.mockResolvedValue({ count: 1 });
        db.user.findUnique.mockResolvedValue({
            id: "u1",
            emailVerified: verifiedAt,
        });

        await consumePasswordResetToken("raw", "new-hash");
        expect(db.user.update.mock.calls[0]?.[0].data.emailVerified).toBe(
            verifiedAt,
        );
    });
});
