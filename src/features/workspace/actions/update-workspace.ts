"use server";

import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { updateWorkspaceSchema } from "@/schemas/workspace";
import { revalidatePath } from "next/cache";

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

        await rawDb.workspace.update({
            where: { id: workspaceId },
            data: {
                name: validated.data.name,
                visibility: validated.data.visibility,
            },
        });

        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/${workspaceId}`);
        revalidatePath("/dashboard");

        return { success: true };
    } catch {
        return { error: "Failed to update workspace" };
    }
}
