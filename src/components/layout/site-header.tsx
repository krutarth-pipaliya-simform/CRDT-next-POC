import Link from "next/link";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { Wordmark } from "@/components/paddock/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { auth } from "@/features/auth/lib/auth";
import { getRecentDocuments } from "@/features/document/queries/get-recent-documents";
import { NotificationBell } from "@/features/notification/components/notification-bell";
import { getWorkspacesForUser } from "@/features/workspace/queries/get-workspaces";
import { db } from "@/lib/db";
import { formatRelativeTime } from "@/lib/format-time";

import { AccountMenu } from "./account-menu";
import { AppMenu } from "./app-menu";
import type { ShellWorkspace } from "./types";
import { WorkspaceSwitcher } from "./workspace-switcher";

/**
 * The header on every signed-in page: wordmark, the current workspace, then
 * notifications, the caller's own face and the burger. Sticky, on paper, over
 * a single hairline.
 */
export async function SiteHeader() {
    const session = await auth();
    const userId = session?.user?.id;

    // Fresh from the database so the avatar updates right after an upload.
    const user = userId
        ? await db.user.findUnique({
              where: { id: userId },
              select: { id: true, name: true, email: true, image: true },
          })
        : null;

    if (!user) {
        return (
            <header className="sticky top-0 z-40 border-b border-paddock-rule bg-paddock-paper">
                <div className="flex items-center justify-between gap-4 px-4 py-4 sm:px-6">
                    <Link href="/" className="no-underline">
                        <Wordmark />
                    </Link>
                    <div className="flex items-center gap-2.5">
                        <ThemeToggle className="hidden sm:inline-flex" />
                        <PaddockLinkButton
                            href="/login"
                            variant="ghost"
                            size="sm"
                        >
                            Log in
                        </PaddockLinkButton>
                        <PaddockLinkButton href="/register" size="sm">
                            Start writing
                        </PaddockLinkButton>
                    </div>
                </div>
            </header>
        );
    }

    const [memberships, recent] = await Promise.all([
        getWorkspacesForUser(user.id),
        getRecentDocuments(),
    ]);

    const workspaces: ShellWorkspace[] = memberships.flatMap((workspace) => {
        const membership = workspace.members.find(
            (member) => member.userId === user.id,
        );
        return membership
            ? [
                  {
                      id: workspace.id,
                      name: workspace.name,
                      role: membership.role,
                  },
              ]
            : [];
    });

    const displayName = user.name || user.email || "You";

    return (
        <header className="sticky top-0 z-40 border-b border-paddock-rule bg-paddock-paper">
            <div className="flex items-center justify-between gap-3 px-4 py-4 sm:gap-4 sm:px-6">
                <Link
                    href="/dashboard"
                    aria-label="Converge — your workspaces"
                    className="shrink-0 no-underline"
                >
                    <Wordmark />
                </Link>
                <WorkspaceSwitcher workspaces={workspaces} />
                <div className="flex shrink-0 items-center gap-2.5">
                    <NotificationBell />
                    <AccountMenu
                        user={{
                            id: user.id,
                            name: displayName,
                            email: user.email,
                            image: user.image,
                        }}
                    />
                    <AppMenu
                        workspaces={workspaces}
                        recentDocuments={recent.map((document) => ({
                            id: document.id,
                            title: document.title,
                            meta: `edited ${formatRelativeTime(document.updatedAt)}`,
                        }))}
                    />
                </div>
            </div>
        </header>
    );
}
