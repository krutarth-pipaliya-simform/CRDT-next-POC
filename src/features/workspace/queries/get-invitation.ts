import "server-only";
import { rawDb } from "@/lib/db";

export async function getInvitationByToken(token: string) {
    return rawDb.workspaceInvitation.findUnique({
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
