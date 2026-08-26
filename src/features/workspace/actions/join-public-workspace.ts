"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";

export async function joinPublicWorkspaceAction(workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;

        const workspace = await rawDb.workspace.findUnique({
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
        const isMember = workspace.members.some((m) => m.userId === userId);

        if (!isMember) {
            await rawDb.workspaceMember.create({
                data: {
                    workspaceId,
                    userId,
                    role: Role.MEMBER,
                },
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
