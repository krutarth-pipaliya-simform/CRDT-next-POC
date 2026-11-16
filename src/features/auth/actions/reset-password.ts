"use server";

import bcrypt from "bcryptjs";

import { consumePasswordResetToken } from "@/features/auth/lib/password-reset-tokens";
import { reportError } from "@/lib/report-error";
import { resetPasswordSchema } from "@/schemas/auth";

export type ResetPasswordResult =
    { success: true; message: string } | { success: false; error: string };

export async function resetPasswordAction(
    state: unknown,
    formData: FormData,
): Promise<ResetPasswordResult> {
    const parsed = resetPasswordSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    const { token, password } = parsed.data;

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const result = await consumePasswordResetToken(token, passwordHash);

        if (!result.success) {
            return result;
        }

        return {
            success: true,
            message: "Your password has been changed. Log in with the new one.",
        };
    } catch (error) {
        reportError("Reset password error:", error);
        return {
            success: false,
            error: "We could not reset your password. Try again.",
        };
    }
}
