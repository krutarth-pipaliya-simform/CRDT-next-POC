import {
    isSectionCurrent,
    workspaceSections,
} from "@/components/layout/workspace-sections";
import type { BackLinkProps } from "@/components/paddock/back-link";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";

import "server-only";

type ProfileBackLink = Omit<BackLinkProps, "className">;

const ALL_WORKSPACES: ProfileBackLink = {
    href: "/dashboard",
    label: "All workspaces",
    "aria-label": "Back to all workspaces",
};

/**
 * Where "back" goes from the profile page. A path inside a workspace the caller
 * can still open is named after that workspace and section; anything else
 * (no `from`, the dashboard, a workspace they have since lost) goes to the
 * workspace list. `from` must already have passed `profileSearchParamsSchema`.
 */
export async function resolveProfileBackLink(
    from: string | undefined,
): Promise<ProfileBackLink> {
    if (!from) return ALL_WORKSPACES;

    const path = from.split(/[?#]/)[0];
    const [segment] = path.split("/").filter(Boolean);
    if (!segment || segment === "dashboard") return ALL_WORKSPACES;

    // Re-checked on every request: membership may have changed since the
    // link was made.
    const role = await getWorkspaceRole(segment);
    if (!role) return ALL_WORKSPACES;
    const workspace = await db.workspace.findUnique({
        where: { id: segment },
        select: { name: true },
    });
    if (!workspace) return ALL_WORKSPACES;

    const section = workspaceSections(segment, role).find((candidate) =>
        isSectionCurrent(path, candidate),
    );
    const label =
        section && section.label !== "Overview"
            ? `${workspace.name} · ${section.label}`
            : workspace.name;

    return { href: from, label, "aria-label": `Back to ${label}` };
}
