"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { updateWorkspaceSchema } from "@/schemas/workspace";

export async function updateWorkspaceAction(
    workspaceId: string,
    state: unknown,
    formData: FormData,
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const role = await getWorkspaceRole(workspaceId);
        if (role !== "ADMIN") {
            return {
                error: "Forbidden: Only admins can update workspace settings",
            };
        }

        const data = Object.fromEntries(formData.entries());
        const validated = updateWorkspaceSchema.safeParse(data);
        if (!validated.success) {
            return {
                error: validated.error.issues[0]?.message || "Invalid input",
            };
        }

        await db.workspace.update({
            where: { id: workspaceId },
            data: {
                name: validated.data.name,
                visibility: validated.data.visibility,
            },
        });

        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/${workspaceId}`, "layout");
        revalidatePath("/dashboard", "layout");

        return { success: true };
    } catch {
        return { error: "Failed to update workspace" };
    }
}
