import "server-only";
import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";

export async function getWorkspaceJoinRequests(workspaceId: string) {
    const session = await auth();
    if (!session?.user?.id) return [];

    const role = await getWorkspaceRole(workspaceId);
    if (role !== "ADMIN") return [];

    return rawDb.workspaceJoinRequest.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });
}
