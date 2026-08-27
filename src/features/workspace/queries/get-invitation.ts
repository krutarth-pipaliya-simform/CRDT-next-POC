import { db } from "@/lib/db";

import "server-only";

export async function getInvitationByToken(token: string) {
    return db.workspaceInvitation.findUnique({
        where: { token },
        include: {
            workspace: {
                select: {
                    id: true,
                    name: true,
                },
            },
        },
    });
}
