"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { rawDb } from "@/lib/db";

export async function removeMemberAction(
    workspaceId: string,
    targetMemberId: string,
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const callerRole = await getWorkspaceRole(workspaceId);
        if (callerRole !== "ADMIN") {
            return { error: "Forbidden: Only admins can remove members" };
        }

        // Find target member
        const member = await rawDb.workspaceMember.findUnique({
            where: { id: targetMemberId },
        });

        if (!member || member.workspaceId !== workspaceId) {
            return { error: "Member not found in this workspace" };
        }

        // Prevent admin from removing themselves
        if (member.userId === session.user.id) {
            return {
                error: "Cannot remove yourself. Transfer admin role or delete workspace instead.",
            };
        }

        await rawDb.workspaceMember.delete({
            where: { id: targetMemberId },
        });

        revalidatePath(`/${workspaceId}/settings/members`);
        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/${workspaceId}`, "layout");
        revalidatePath("/dashboard", "layout");

        return { success: true };
    } catch {
        return { error: "Failed to remove member" };
    }
}
