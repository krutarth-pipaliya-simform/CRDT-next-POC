import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getWorkspaceRole = cache(async (workspaceId: string) => {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const [member, workspace] = await Promise.all([
        rawDb.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId: session.user.id,
            },
        }),
        rawDb.workspace.findUnique({
            where: { id: workspaceId },
            select: { visibility: true },
        }),
    ]);

    if (member?.role) {
        return member.role;
    }

    // If not an explicit member, check workspace visibility policy
    if (workspace?.visibility === "PUBLIC") {
        return Role.GUEST;
    }

    return null;
});

export async function verifyWorkspaceRole(
    workspaceId: string,
    allowedRoles: Role[],
) {
    const role = await getWorkspaceRole(workspaceId);

    if (!role) {
        redirect("/unauthorized");
    }

    if (!allowedRoles.includes(role)) {
        redirect(`/${workspaceId}/unauthorized`);
    }

    return role;
}
