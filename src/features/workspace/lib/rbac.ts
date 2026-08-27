import { cache } from "react";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";

export const getWorkspaceRole = cache(async (workspaceId: string) => {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const [member, workspace] = await Promise.all([
        db.workspaceMember.findFirst({
            where: {
                workspaceId,
                userId: session.user.id,
            },
        }),
        db.workspace.findUnique({
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
