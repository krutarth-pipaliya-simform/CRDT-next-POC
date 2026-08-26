"use server";

import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

export async function handleJoinRequestAction(
    workspaceId: string,
    requestId: string,
    action: "APPROVE" | "REJECT",
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const callerRole = await getWorkspaceRole(workspaceId);
        if (callerRole !== "ADMIN") {
            return {
                error: "Forbidden: Only workspace admins can manage join requests",
            };
        }

        const request = await rawDb.workspaceJoinRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.workspaceId !== workspaceId) {
            return { error: "Join request not found" };
        }

        if (action === "APPROVE") {
            const existingMember = await rawDb.workspaceMember.findFirst({
                where: {
                    workspaceId,
                    userId: request.userId,
                },
            });

            if (!existingMember) {
                await rawDb.$transaction([
                    rawDb.workspaceJoinRequest.update({
                        where: { id: requestId },
                        data: { status: "APPROVED" },
                    }),
                    rawDb.workspaceMember.create({
                        data: {
                            workspaceId,
                            userId: request.userId,
                            role: Role.MEMBER,
                        },
                    }),
                ]);
            } else {
                await rawDb.workspaceJoinRequest.update({
                    where: { id: requestId },
                    data: { status: "APPROVED" },
                });
            }
        } else {
            await rawDb.workspaceJoinRequest.update({
                where: { id: requestId },
                data: { status: "REJECTED" },
            });
        }

        revalidatePath(`/${workspaceId}/settings/members`);
        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/${workspaceId}`);
        revalidatePath("/dashboard");

        return { success: true };
    } catch (error) {
        console.error("Handle join request error:", error);
        return { error: "Failed to process join request" };
    }
}
