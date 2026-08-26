"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { rawDb } from "@/lib/db";

export interface TransferCandidate {
    id: string;
    role: string;
    user: {
        id: string;
        name: string | null;
        email: string | null;
        image: string | null;
    };
}

export async function getTransferCandidatesAction(
    workspaceId: string,
): Promise<{ success: boolean; data?: TransferCandidate[]; error?: string }> {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Unauthorized" };
        }

        const role = await getWorkspaceRole(workspaceId);
        if (!role) {
            return {
                success: false,
                error: "You do not have access to this workspace",
            };
        }

        const members = await rawDb.workspaceMember.findMany({
            where: {
                workspaceId,
                userId: {
                    not: session.user.id,
                },
            },
            select: {
                id: true,
                role: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
            },
            orderBy: {
                role: "asc",
            },
        });

        return {
            success: true,
            data: members,
        };
    } catch {
        return {
            success: false,
            error: "Failed to load workspace members",
        };
    }
}
