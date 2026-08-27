"use server";

import bcrypt from "bcryptjs";

import { auth } from "@/features/auth/lib/auth";
import { updatePasswordSchema } from "@/features/profile/schemas";
import { db } from "@/lib/db";

export type UpdatePasswordResult =
    | {
          success: true;
          data: { message: string };
          error?: never;
          code?: never;
      }
    | {
          success: false;
          error: string;
          code: string;
          data?: never;
      };

export async function updatePassword(
    prevState: unknown,
    formData: FormData,
): Promise<UpdatePasswordResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updatePasswordSchema.safeParse(data);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0].message,
            code: "VALIDATION_ERROR",
        };
    }

    const { currentPassword, newPassword } = parsed.data;

    try {
        const user = await db.user.findUnique({
            where: { id: session.user.id },
        });

        if (!user || !user.password) {
            return {
                success: false,
                error: "Password not set for this account (maybe you signed in with Google/GitHub?)",
                code: "NO_PASSWORD",
            };
        }

        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return {
                success: false,
                error: "Incorrect current password",
                code: "INVALID_PASSWORD",
            };
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.user.update({
            where: { id: session.user.id },
            data: { password: hashedPassword },
        });

        return {
            success: true,
            data: { message: "Password updated successfully" },
        };
    } catch (error) {
        console.error("Update password error:", error);
        return {
            success: false,
            error: "Failed to update password",
            code: "INTERNAL_ERROR",
        };
    }
}
