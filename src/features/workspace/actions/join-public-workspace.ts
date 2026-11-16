"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { notify } from "@/features/notification/lib/notify";
import { db } from "@/lib/db";

export async function joinPublicWorkspaceAction(workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        const workspace = await db.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    select: { userId: true },
                },
            },
        });

        if (!workspace) {
            return { error: "Workspace not found" };
        }

        if (workspace.visibility !== "PUBLIC") {
            return { error: "This workspace is not public" };
        }

        // Check if already a member
        const isMember = workspace.members.some(
            (m: { userId: string }) => m.userId === userId,
        );

        if (!isMember) {
            await db.workspaceMember.create({
                data: {
                    workspaceId,
                    userId,
                    role: Role.MEMBER,
                },
            });

            await notify({
                type: "MEMBER_JOINED",
                title: `${session.user.name || session.user.email || "Someone"} joined the workspace`,
                body: null,
                // Overview, not settings/members — that page is Admin-only
                href: `/${workspaceId}`,
                workspaceId,
                actorId: userId,
                excludeUserIds: [userId],
            });
        }

        revalidatePath("/dashboard");
        revalidatePath(`/${workspaceId}`);

        return { success: true };
    } catch (error) {
        console.error("Join public workspace error:", error);
        return { error: "Failed to join workspace" };
    }
}
