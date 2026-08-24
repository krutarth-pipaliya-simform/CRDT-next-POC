import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";
import { redirect } from "next/navigation";
import { cache } from "react";

export const getWorkspaceRole = cache(async (workspaceId: string) => {
    const session = await auth();
    if (!session?.user?.id) {
        return null;
    }

    const member = await db.workspaceMember.findFirst({
        where: {
            workspaceId,
            userId: session.user.id,
        },
    });

    return member?.role || null;
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
