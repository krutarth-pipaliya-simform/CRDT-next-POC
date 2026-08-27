"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";

export async function joinWorkspaceAction(token: string) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "You must be signed in to join a workspace" };
    }

    let workspaceId: string;
    try {
        const invitation = await db.workspaceInvitation.findUnique({
            where: { token },
        });

        if (!invitation) {
            return { error: "Invalid invitation link" };
        }

        if (invitation.usedAt) {
            return { error: "This invitation link has already been used" };
        }

        if (invitation.expiresAt < new Date()) {
            return { error: "This invitation link has expired" };
        }

        workspaceId = invitation.workspaceId;

        // Check if user is already a member
        const existingMember = await db.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId: session.user.id,
            },
        });

        if (!existingMember) {
            // Join as MEMBER and mark invitation as used
            await db.$transaction([
                db.workspaceMember.create({
                    data: {
                        workspaceId,
                        userId: session.user.id,
                        role: "MEMBER",
                    },
                }),
                db.workspaceInvitation.update({
                    where: { id: invitation.id },
                    data: { usedAt: new Date() },
                }),
            ]);
        }

        revalidatePath(`/${workspaceId}`);
        revalidatePath("/dashboard");
    } catch {
        return { error: "Failed to join workspace" };
    }

    redirect(`/${workspaceId}`);
}
