"use server";

import { sendVerificationEmail } from "@/features/auth/lib/email";
import { generateVerificationToken } from "@/features/auth/lib/tokens";
import { db } from "@/lib/db";
import { getAppUrl } from "@/lib/url";

export type ResendVerificationResult =
    | { success: true; message: string; verifyUrl?: string; error?: never }
    | { success?: false; error: string; message?: never; verifyUrl?: never };

export async function resendVerificationAction(
    email: string,
): Promise<ResendVerificationResult> {
    try {
        const user = await db.user.findUnique({
            where: { email },
        });

        if (!user) {
            return { error: "User not found" };
        }

        if (user.emailVerified) {
            return { error: "Email already verified" };
        }

        const recentToken = await db.verificationToken.findFirst({
            where: { identifier: email },
        });

        if (recentToken) {
            // Rate limiting: expires is 24 hours from creation.
            const createdAt = new Date(
                recentToken.expires.getTime() - 24 * 60 * 60 * 1000,
            );
            const now = new Date();
            const timeSinceCreation = now.getTime() - createdAt.getTime();

            // Allow 1 email every 60 seconds
            if (timeSinceCreation < 60 * 1000) {
                return {
                    error: "Please wait 60 seconds before requesting another email.",
                };
            }
        }

        const verificationToken = await generateVerificationToken(email);
        const appUrl = await getAppUrl();
        const verifyUrl = `${appUrl}/verify-email?token=${verificationToken.token}`;

        await sendVerificationEmail(
            verificationToken.identifier,
            verificationToken.token,
            appUrl,
        );

        return {
            success: true,
            message: "Verification email sent!",
            verifyUrl:
                process.env.NODE_ENV !== "production" ||
                !process.env.EMAIL_SERVER_HOST
                    ? verifyUrl
                    : undefined,
        };
    } catch (error) {
        console.error("Resend verification error:", error);
        return { error: "Failed to send verification email" };
    }
}
