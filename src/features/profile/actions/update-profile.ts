"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { updateProfileSchema } from "@/features/profile/schemas";
import { db } from "@/lib/db";

export type UpdateProfileResult =
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

export async function updateProfile(
    prevState: unknown,
    formData: FormData,
): Promise<UpdateProfileResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const data = Object.fromEntries(formData.entries());
    const parsed = updateProfileSchema.safeParse(data);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0].message,
            code: "VALIDATION_ERROR",
        };
    }

    try {
        await db.user.update({
            where: { id: session.user.id },
            data: { name: parsed.data.name },
        });

        revalidatePath("/profile");
        return {
            success: true,
            data: { message: "Profile updated successfully" },
        };
    } catch (error) {
        console.error("Update profile error:", error);
        return {
            success: false,
            error: "Failed to update profile",
            code: "INTERNAL_ERROR",
        };
    }
}
