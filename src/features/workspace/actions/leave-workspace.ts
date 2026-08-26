"use server";

import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";
import { leaveWorkspaceSchema } from "@/schemas/workspace";

export async function leaveWorkspaceAction(
    workspaceId: string,
    transferToMemberId?: string,
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Unauthorized" };
        }

        const validated = leaveWorkspaceSchema.safeParse({
            workspaceId,
            transferToMemberId,
        });

        if (!validated.success) {
            return {
                error:
                    validated.error.issues[0]?.message ||
                    "Invalid input parameters",
            };
        }

        // Fetch caller's membership record in this workspace
        const currentMember = await rawDb.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId: session.user.id,
            },
        });

        if (!currentMember) {
            return { error: "You are not a member of this workspace" };
        }

        // If the caller is not an ADMIN (e.g. MEMBER or GUEST), they can leave directly
        if (currentMember.role !== Role.ADMIN) {
            await rawDb.workspaceMember.delete({
                where: { id: currentMember.id },
            });

            revalidatePath(`/${workspaceId}`);
            revalidatePath(`/${workspaceId}`, "layout");
            revalidatePath(`/${workspaceId}/settings`);
            revalidatePath(`/${workspaceId}/settings/members`);
            revalidatePath("/dashboard");
            revalidatePath("/dashboard", "layout");

            return { success: true };
        }

        // Caller is an ADMIN: Retrieve other members to validate transfer
        const otherMembers = await rawDb.workspaceMember.findMany({
            where: {
                workspaceId,
                userId: {
                    not: session.user.id,
                },
            },
        });

        // Edge Case 1: Admin is the only member in the workspace
        if (otherMembers.length === 0) {
            return {
                error: "You are the only member in this workspace. You cannot leave without appointing another admin. You can delete the workspace instead if you no longer need it.",
            };
        }

        // Edge Case 2: No new admin member specified
        if (!transferToMemberId) {
            return {
                error: "As an admin, you must transfer ownership to another member before leaving.",
            };
        }

        // Edge Case 3: Admin attempts to transfer to themselves
        if (
            transferToMemberId === currentMember.id ||
            transferToMemberId === session.user.id
        ) {
            return {
                error: "Cannot transfer ownership to yourself. Please select another eligible member.",
            };
        }

        // Edge Case 4: Target member not found in this workspace
        const targetMember = otherMembers.find(
            (m) =>
                m.id === transferToMemberId || m.userId === transferToMemberId,
        );

        if (!targetMember) {
            return {
                error: "The selected member was not found or is not eligible for ownership transfer.",
            };
        }

        // Atomic transaction: Appoint new admin and remove original admin's membership
        await rawDb.$transaction([
            rawDb.workspaceMember.update({
                where: { id: targetMember.id },
                data: { role: Role.ADMIN },
            }),
            rawDb.workspaceMember.delete({
                where: { id: currentMember.id },
            }),
        ]);

        revalidatePath(`/${workspaceId}`);
        revalidatePath(`/${workspaceId}`, "layout");
        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/${workspaceId}/settings/members`);
        revalidatePath("/dashboard");
        revalidatePath("/dashboard", "layout");

        return { success: true };
    } catch {
        return { error: "Failed to leave workspace. Please try again." };
    }
}
