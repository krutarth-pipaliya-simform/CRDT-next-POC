import crypto from "crypto";

import { db } from "@/lib/db";

/**
 * Password reset tokens live in the Auth.js `VerificationToken` table beside
 * the email verification tokens, kept apart by two things: the identifier is
 * namespaced (`password-reset:<email>`), and the stored token is the SHA-256
 * of the one emailed. A verification token can therefore never be redeemed as
 * a reset token or the other way round, and a database read leaks no usable
 * reset link.
 */
const RESET_IDENTIFIER_PREFIX = "password-reset:";
const RESET_TTL_MS = 60 * 60 * 1000;
const RESEND_COOLDOWN_MS = 60 * 1000;

function hashToken(rawToken: string) {
    return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function resetIdentifier(email: string) {
    return `${RESET_IDENTIFIER_PREFIX}${email}`;
}

export type CreatePasswordResetTokenResult =
    { status: "created"; token: string } | { status: "cooldown" };

/**
 * Issues a fresh one-hour token for `email`, replacing any earlier one, unless
 * one was issued in the last minute.
 */
export async function createPasswordResetToken(
    email: string,
): Promise<CreatePasswordResetTokenResult> {
    const identifier = resetIdentifier(email);
    const existing = await db.verificationToken.findFirst({
        where: { identifier },
        orderBy: { expires: "desc" },
    });

    if (existing) {
        const issuedAt = existing.expires.getTime() - RESET_TTL_MS;
        if (Date.now() - issuedAt < RESEND_COOLDOWN_MS) {
            return { status: "cooldown" };
        }
    }

    const token = crypto.randomBytes(32).toString("hex");

    await db.$transaction([
        db.verificationToken.deleteMany({ where: { identifier } }),
        db.verificationToken.create({
            data: {
                identifier,
                token: hashToken(token),
                expires: new Date(Date.now() + RESET_TTL_MS),
            },
        }),
    ]);

    return { status: "created", token };
}

export type PasswordResetTokenStatus = "valid" | "expired" | "invalid";

/** Lets the reset page say "expired" before the user types a new password. */
export async function getPasswordResetTokenStatus(
    rawToken: string,
): Promise<PasswordResetTokenStatus> {
    const record = await db.verificationToken.findUnique({
        where: { token: hashToken(rawToken) },
    });

    if (!record || !record.identifier.startsWith(RESET_IDENTIFIER_PREFIX)) {
        return "invalid";
    }

    return record.expires < new Date() ? "expired" : "valid";
}

export type ConsumePasswordResetTokenResult =
    { success: true } | { success: false; error: string };

/**
 * Redeems a token once and sets the password hash. The token is deleted with a
 * conditional `deleteMany` inside the transaction, so of two concurrent
 * redemptions only the one that deletes the row writes a password. Following
 * the link proves the inbox is the user's, so an unverified email becomes
 * verified, and every other outstanding reset token for the address dies too.
 */
export async function consumePasswordResetToken(
    rawToken: string,
    passwordHash: string,
): Promise<ConsumePasswordResetTokenResult> {
    const hashed = hashToken(rawToken);

    return db.$transaction(
        async (tx): Promise<ConsumePasswordResetTokenResult> => {
            const record = await tx.verificationToken.findUnique({
                where: { token: hashed },
            });

            if (
                !record ||
                !record.identifier.startsWith(RESET_IDENTIFIER_PREFIX)
            ) {
                return {
                    success: false,
                    error: "This reset link is invalid or has already been used.",
                };
            }

            if (record.expires < new Date()) {
                await tx.verificationToken.deleteMany({
                    where: { token: hashed },
                });
                return {
                    success: false,
                    error: "This reset link has expired. Request a new one.",
                };
            }

            const claimed = await tx.verificationToken.deleteMany({
                where: { token: hashed },
            });
            if (claimed.count === 0) {
                return {
                    success: false,
                    error: "This reset link is invalid or has already been used.",
                };
            }

            const email = record.identifier.slice(
                RESET_IDENTIFIER_PREFIX.length,
            );
            const user = await tx.user.findUnique({ where: { email } });
            if (!user) {
                return {
                    success: false,
                    error: "This reset link is invalid or has already been used.",
                };
            }

            await tx.user.update({
                where: { id: user.id },
                data: {
                    password: passwordHash,
                    emailVerified: user.emailVerified ?? new Date(),
                },
            });

            await tx.verificationToken.deleteMany({
                where: { identifier: record.identifier },
            });

            return { success: true };
        },
    );
}
