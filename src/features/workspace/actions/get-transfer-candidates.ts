"use server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

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

export type GetTransferCandidatesResult =
    | { success: true; data: TransferCandidate[]; error?: never }
    | { success: false; error: string; data?: never };

export async function getTransferCandidatesAction(
    workspaceId: string,
): Promise<GetTransferCandidatesResult> {
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

        const members = await db.workspaceMember.findMany({
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
