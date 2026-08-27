import crypto from "crypto";

import { db } from "@/lib/db";

export async function generateVerificationToken(email: string) {
    const token = crypto.randomBytes(32).toString("hex");
    // 24 hours expiry
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    // Remove any existing tokens for this email to invalidate old ones
    await db.verificationToken.deleteMany({
        where: { identifier: email },
    });

    const verificationToken = await db.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return verificationToken;
}

export async function verifyToken(token: string) {
    const existingToken = await db.verificationToken.findUnique({
        where: { token },
    });

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    if (existingToken.expires < new Date()) {
        return { error: "Token has expired!" };
    }

    const existingUser = await db.user.findUnique({
        where: { email: existingToken.identifier },
    });

    if (!existingUser) {
        return { error: "User not found!" };
    }

    await db.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: new Date() },
    });

    await db.verificationToken.delete({
        where: { token: existingToken.token },
    });

    return { success: "Email verified successfully!" };
}
