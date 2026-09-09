"use server";

import fs from "fs/promises";
import path from "path";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";

const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
];
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

export type UploadDocumentImageResult =
    | { success: true; data: { url: string } }
    | { success: false; error: string };

export async function uploadDocumentImageAction(
    formData: FormData,
): Promise<UploadDocumentImageResult> {
    const session = await auth();
    if (!session?.user?.id) {
        return { success: false, error: "Unauthorized" };
    }

    const workspaceId = formData.get("workspaceId");
    if (typeof workspaceId !== "string" || !workspaceId) {
        return { success: false, error: "Workspace ID is required" };
    }

    const role = await getWorkspaceRole(workspaceId);
    if (!role || (role !== "ADMIN" && role !== "MEMBER")) {
        return {
            success: false,
            error: "You do not have permission to upload files in this workspace",
        };
    }

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
        return { success: false, error: "No file provided" };
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
        return {
            success: false,
            error: "Invalid file type. Only JPG, PNG, WebP, GIF, and SVG are supported.",
        };
    }

    if (file.size > MAX_SIZE) {
        return {
            success: false,
            error: "File size exceeds 5MB limit",
        };
    }

    try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const ext = file.name.split(".").pop()?.toLowerCase() || "png";
        const sanitizedExt = ext.replace(/[^a-z0-9]/g, "");
        const filename = `doc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${sanitizedExt}`;

        const uploadsDir = path.join(
            process.cwd(),
            "storage",
            "uploads",
            "documents",
        );
        await fs.mkdir(uploadsDir, { recursive: true });
        const filepath = path.join(uploadsDir, filename);

        await fs.writeFile(filepath, buffer);
        const url = `/api/uploads/documents/${filename}`;

        return {
            success: true,
            data: { url },
        };
    } catch (error) {
        console.error("[Upload Document Image] Error:", error);
        return {
            success: false,
            error: "Failed to upload image to server",
        };
    }
}
