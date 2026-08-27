"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

export async function deleteWorkspaceAction(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const role = await getWorkspaceRole(workspaceId);
    if (role !== "ADMIN") {
        return { error: "Forbidden: Only admins can delete a workspace" };
    }

    try {
        await db.workspace.delete({
            where: { id: workspaceId },
        });

        revalidatePath("/dashboard");
    } catch {
        return { error: "Failed to delete workspace" };
    }

    redirect("/dashboard");
}
