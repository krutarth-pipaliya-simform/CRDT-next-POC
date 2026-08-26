"use server";

import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function requestToJoinWorkspaceAction(workspaceId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id || !session?.user?.email) {
            return { error: "Unauthorized" };
        }

        const userId = session.user.id;
        const userEmail = session.user.email;

        const workspace = await rawDb.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
            },
        });

        if (!workspace) {
            return { error: "Workspace not found" };
        }

        // Check if already a member
        const isMember = workspace.members.some((m) => m.userId === userId);
        if (isMember) {
            return { error: "You are already a member of this workspace" };
        }

        // For ORGANIZATION visibility, verify domain match
        if (workspace.visibility === "ORGANIZATION") {
            const userDomain = userEmail.split("@")[1];
            const hasDomainMatch = workspace.members.some(
                (m) => m.user.email && m.user.email.endsWith(`@${userDomain}`),
            );
            if (!hasDomainMatch) {
                return {
                    error: "This workspace is restricted to another organization",
                };
            }
        }

        // Create or update join request
        await rawDb.workspaceJoinRequest.upsert({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: session.user.id,
                },
            },
            create: {
                workspaceId,
                userId: session.user.id,
                status: "PENDING",
            },
            update: {
                status: "PENDING",
                updatedAt: new Date(),
            },
        });

        revalidatePath("/dashboard");
        revalidatePath(`/${workspaceId}/settings/members`);

        return {
            success: true,
            message: "Join request submitted successfully!",
        };
    } catch (error) {
        console.error("Join request error:", error);
        return { error: "Failed to submit join request" };
    }
}
