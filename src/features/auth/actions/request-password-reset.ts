"use server";

import { sendPasswordResetEmail } from "@/features/auth/lib/email";
import { createPasswordResetToken } from "@/features/auth/lib/password-reset-tokens";
import { db } from "@/lib/db";
import { reportError } from "@/lib/report-error";
import { getAppUrl } from "@/lib/url";
import { forgotPasswordSchema } from "@/schemas/auth";

export type RequestPasswordResetResult =
    | { success: true; message: string; resetUrl?: string }
    | { success: false; error: string };

/**
 * The answer is the same whether or not the address has an account, so the
 * form cannot be used to find out who is registered. Accounts created through
 * Google or GitHub have no password yet; a reset gives them one.
 */
const GENERIC_MESSAGE =
    "If an account exists for that email, a reset link is on its way. It expires in 1 hour.";

export async function requestPasswordResetAction(
    state: unknown,
    formData: FormData,
): Promise<RequestPasswordResetResult> {
    const parsed = forgotPasswordSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { email } = parsed.data;

    try {
        const user = await db.user.findUnique({
            where: { email },
            select: { id: true },
        });
        if (!user) {
            return { success: true, message: GENERIC_MESSAGE };
        }

        const issued = await createPasswordResetToken(email);
        if (issued.status === "cooldown") {
            return { success: true, message: GENERIC_MESSAGE };
        }

        const appUrl = await getAppUrl();
        const resetUrl = `${appUrl}/reset-password?token=${issued.token}`;
        await sendPasswordResetEmail(email, resetUrl);

        return {
            success: true,
            message: GENERIC_MESSAGE,
            // Development only, like the verification quick link. Unlike that
            // one it is never returned in production, even without SMTP: a
            // reset link handed to whoever typed the address is an account
            // takeover.
            resetUrl:
                process.env.NODE_ENV !== "production" ? resetUrl : undefined,
        };
    } catch (error) {
        reportError("Request password reset error:", error);
        return {
            success: false,
            error: "We could not send the reset email. Try again in a minute.",
        };
    }
}
