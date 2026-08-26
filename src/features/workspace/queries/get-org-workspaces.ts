import "server-only";
import { auth } from "@/features/auth/lib/auth";
import { rawDb } from "@/lib/db";

interface GetOrgWorkspacesParams {
    query?: string;
    page?: number;
    pageSize?: number;
    userId?: string;
    userEmail?: string;
}

export async function getOrganizationWorkspaces({
    query = "",
    page = 1,
    pageSize = 6,
    userId: providedUserId,
    userEmail: providedUserEmail,
}: GetOrgWorkspacesParams = {}) {
    let userId = providedUserId;
    let userEmail = providedUserEmail;

    if (!userId || !userEmail) {
        const session = await auth();
        userId = session?.user?.id;
        userEmail = session?.user?.email ?? undefined;
    }

    if (!userId || !userEmail) {
        return {
            workspaces: [],
            totalCount: 0,
            totalPages: 1,
            currentPage: 1,
            userDomain: null,
        };
    }

    const emailParts = userEmail.split("@");
    const userDomain = emailParts.length > 1 ? emailParts[1] : null;

    if (!userDomain) {
        return {
            workspaces: [],
            totalCount: 0,
            totalPages: 1,
            currentPage: 1,
            userDomain: null,
        };
    }

    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * pageSize;

    // Matches ORGANIZATION workspaces where any member shares the user's email domain
    const where = {
        visibility: "ORGANIZATION" as const,
        members: {
            some: {
                user: {
                    email: {
                        contains: `@${userDomain}`,
                        mode: "insensitive" as const,
                    },
                },
            },
        },
        ...(query.trim()
            ? {
                  name: {
                      contains: query.trim(),
                      mode: "insensitive" as const,
                  },
              }
            : {}),
    };

    const [totalCount, workspaces] = await Promise.all([
        rawDb.workspace.count({ where }),
        rawDb.workspace.findMany({
            where,
            include: {
                members: { select: { role: true, userId: true } },
                joinRequests: {
                    where: { userId },
                    select: { id: true, status: true },
                },
                _count: { select: { members: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: pageSize,
        }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    return {
        workspaces,
        totalCount,
        totalPages,
        currentPage: validPage,
        userDomain,
    };
}
