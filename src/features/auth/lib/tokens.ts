import { rawDb } from "@/lib/db";
import crypto from "crypto";

export async function generateVerificationToken(email: string) {
    const token = crypto.randomBytes(32).toString("hex");
    // 24 hours expiry
    const expires = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);

    // Remove any existing tokens for this email to invalidate old ones
    await rawDb.verificationToken.deleteMany({
        where: { identifier: email },
    });

    const verificationToken = await rawDb.verificationToken.create({
        data: {
            identifier: email,
            token,
            expires,
        },
    });

    return verificationToken;
}

export async function verifyToken(token: string) {
    const existingToken = await rawDb.verificationToken.findUnique({
        where: { token },
    });

    if (!existingToken) {
        return { error: "Invalid token!" };
    }

    if (existingToken.expires < new Date()) {
        return { error: "Token has expired!" };
    }

    const existingUser = await rawDb.user.findUnique({
        where: { email: existingToken.identifier },
    });

    if (!existingUser) {
        return { error: "User not found!" };
    }

    await rawDb.user.update({
        where: { id: existingUser.id },
        data: { emailVerified: new Date() },
    });

    await rawDb.verificationToken.delete({
        where: { token: existingToken.token },
    });

    return { success: "Email verified successfully!" };
}
