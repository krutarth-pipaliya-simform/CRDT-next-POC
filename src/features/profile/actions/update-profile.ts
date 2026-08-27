"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { updateProfileSchema } from "@/features/profile/schemas";
import { db } from "@/lib/db";

export async function updateProfile(prevState: unknown, formData: FormData) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const name = formData.get("name") as string;

    const parsed = updateProfileSchema.safeParse({ name });
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
