"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

export async function createInvitationAction(workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const role = await getWorkspaceRole(workspaceId);
        if (role !== "ADMIN") {
            return { error: "Forbidden: Only admins can invite members" };
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry (FR-8)

        const invitation = await db.workspaceInvitation.create({
            data: {
                workspaceId,
                createdById: session.user.id,
                expiresAt,
            },
        });

        return {
            success: true,
            data: {
                token: invitation.token,
            },
        };
    } catch {
        return { error: "Failed to create invitation" };
    }
}
