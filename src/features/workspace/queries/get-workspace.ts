import "server-only";
import { rawDb } from "@/lib/db";

export async function getWorkspace(workspaceId: string) {
    return rawDb.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            documents: {
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                },
            },
            tasks: {
                select: { id: true, title: true, status: true },
            },
            members: {
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
            },
        },
    });
}
