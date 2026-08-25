"use server";

import { rawDb } from "@/lib/db";
import { auth } from "@/features/auth/lib/auth";
import { revalidatePath } from "next/cache";
import fs from "fs/promises";
import path from "path";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

async function deleteOldImageFile(oldImageUrl: string | null) {
    if (!oldImageUrl || !oldImageUrl.startsWith("/api/uploads/")) {
        return; // Don't attempt to delete external OAuth avatars
    }
    try {
        const relativePath = oldImageUrl.replace("/api/uploads/", "");
        const filePath = path.join(
            process.cwd(),
            "storage",
            "uploads",
            ...relativePath.split("/"),
        );
        await fs.unlink(filePath);
    } catch (e) {
        console.error("Failed to delete old profile picture:", e);
    }
}

export async function uploadProfilePicture(
    prevState: unknown,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
        return { success: false, error: "No file provided", code: "NO_FILE" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            success: false,
            error: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
            code: "INVALID_TYPE",
        };
    }

    if (file.size > MAX_SIZE) {
        return {
            success: false,
            error: "File size exceeds 5MB limit",
            code: "FILE_TOO_LARGE",
        };
    }

    try {
        // Fetch current user to get old image URL
        const user = await rawDb.user.findUnique({
            where: { id: session.user.id },
            select: { image: true },
        });
        const oldImageUrl = user?.image || null;

        const buffer = Buffer.from(await file.arrayBuffer());
        const extension = file.type.split("/")[1];
        const filename = `${session.user.id}-${Date.now()}.${extension}`;

        const uploadsDir = path.join(
            process.cwd(),
            "storage",
            "uploads",
            "profiles",
        );
        await fs.mkdir(uploadsDir, { recursive: true });
        const filepath = path.join(uploadsDir, filename);

        // Upload the new profile picture
        await fs.writeFile(filepath, buffer);
        const imageUrl = `/api/uploads/profiles/${filename}`;

        // Update the user's profile to reference the new image
        await rawDb.user.update({
            where: { id: session.user.id },
            data: { image: imageUrl },
        });

        // Verify that the upload completed successfully (implied if we reach here without throwing)
        // Delete the old image from storage
        await deleteOldImageFile(oldImageUrl);

        revalidatePath("/profile");
        return {
            success: true,
            data: { message: "Profile picture updated successfully", imageUrl },
        };
    } catch (error) {
        console.error("Upload profile picture error:", error);
        return {
            success: false,
            error: "Failed to upload image",
            code: "INTERNAL_ERROR",
        };
    }
}

export async function removeProfilePicture() {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized", code: "UNAUTHORIZED" };
    }

    try {
        const user = await rawDb.user.findUnique({
            where: { id: session.user.id },
            select: { image: true },
        });
        const oldImageUrl = user?.image || null;

        await rawDb.user.update({
            where: { id: session.user.id },
            data: { image: null },
        });

        // Delete the old image from storage
        await deleteOldImageFile(oldImageUrl);

        revalidatePath("/profile");
        return {
            success: true,
            data: { message: "Profile picture removed successfully" },
        };
    } catch (error) {
        console.error("Remove profile picture error:", error);
        return {
            success: false,
            error: "Failed to remove image",
            code: "INTERNAL_ERROR",
        };
    }
}
