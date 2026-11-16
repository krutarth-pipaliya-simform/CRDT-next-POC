import {
    generateVerificationToken,
    verifyToken,
} from "@/features/auth/lib/tokens";
import { db, resetDb } from "@/test/mock-db";

jest.mock("@/lib/db", () => jest.requireActual("@/test/mock-db"));

beforeEach(() => {
    resetDb();
});

describe("generateVerificationToken", () => {
    it("replaces older tokens and stores a 24h random token", async () => {
        db.verificationToken.create.mockImplementation(
            async ({ data }: { data: object }) => data,
        );

        const created = await generateVerificationToken("a@b.co");

        expect(db.verificationToken.deleteMany).toHaveBeenCalledWith({
            where: { identifier: "a@b.co" },
        });
        expect(created.identifier).toBe("a@b.co");
        expect(created.token).toMatch(/^[a-f0-9]{64}$/);
        const ttl = created.expires.getTime() - Date.now();
        expect(ttl).toBeGreaterThan(23.9 * 3600_000);
        expect(ttl).toBeLessThanOrEqual(24 * 3600_000);
    });

    it("never repeats a token", async () => {
        db.verificationToken.create.mockImplementation(
            async ({ data }: { data: object }) => data,
        );
        const a = await generateVerificationToken("a@b.co");
        const b = await generateVerificationToken("a@b.co");
        expect(a.token).not.toBe(b.token);
    });
});

describe("verifyToken", () => {
    it("rejects an unknown token", async () => {
        db.verificationToken.findUnique.mockResolvedValue(null);
        await expect(verifyToken("t")).resolves.toEqual({
            error: "Invalid token!",
        });
    });

    it("rejects an expired token", async () => {
        db.verificationToken.findUnique.mockResolvedValue({
            identifier: "a@b.co",
            token: "t",
            expires: new Date(Date.now() - 1000),
        });
        await expect(verifyToken("t")).resolves.toEqual({
            error: "Token has expired!",
        });
        expect(db.user.update).not.toHaveBeenCalled();
    });

    it("rejects a token whose user is gone", async () => {
        db.verificationToken.findUnique.mockResolvedValue({
            identifier: "a@b.co",
            token: "t",
            expires: new Date(Date.now() + 1000),
        });
        db.user.findUnique.mockResolvedValue(null);
        await expect(verifyToken("t")).resolves.toEqual({
            error: "User not found!",
        });
    });

    it("verifies the email and burns the token", async () => {
        db.verificationToken.findUnique.mockResolvedValue({
            identifier: "a@b.co",
            token: "t",
            expires: new Date(Date.now() + 1000),
        });
        db.user.findUnique.mockResolvedValue({ id: "u1" });

        await expect(verifyToken("t")).resolves.toEqual({
            success: "Email verified successfully!",
        });
        expect(db.user.update.mock.calls[0]?.[0].where).toEqual({ id: "u1" });
        expect(db.verificationToken.delete).toHaveBeenCalledWith({
            where: { token: "t" },
        });
    });
});
