import { db } from "@/lib/db";

import "server-only";

export interface GetPublicWorkspacesParams {
    query?: string;
    page?: number;
    pageSize?: number;
}

export async function getPublicWorkspaces({
    query = "",
    page = 1,
    pageSize = 6,
}: GetPublicWorkspacesParams = {}) {
    const validPage = Math.max(1, page);
    const skip = (validPage - 1) * pageSize;

    const where = {
        visibility: "PUBLIC" as const,
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
        db.workspace.count({ where }),
        db.workspace.findMany({
            where,
            include: {
                members: { select: { role: true, userId: true } },
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
    };
}
