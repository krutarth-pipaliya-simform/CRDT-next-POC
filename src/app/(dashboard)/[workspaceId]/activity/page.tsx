import type { NotificationType } from "@prisma/client";
import { notFound } from "next/navigation";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { ActivityFeed } from "@/features/notification/components/activity-feed";
import { toNotificationPayload } from "@/features/notification/lib/serialize";
import { getNotifications } from "@/features/notification/queries/get-notifications";
import { getWorkspaceActivity } from "@/features/notification/queries/get-workspace-activity";
import {
    ACTIVITY_FEED_LIMIT,
    NOTIFICATION_TYPE_ICONS,
} from "@/features/notification/types";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ActivityPageProps {
    params: Promise<{ workspaceId: string }>;
}

/** What each notification type means, in the order a person meets them. */
const WHAT_LANDS_HERE: { type: NotificationType; text: string }[] = [
    { type: "TASK_ASSIGNED", text: "Someone assigns you a task" },
    { type: "TASK_COMPLETED", text: "A task reaches Done" },
    { type: "DOCUMENT_CREATED", text: "A new document is started" },
    { type: "MEMBER_JOINED", text: "Someone joins the workspace" },
    { type: "MENTION", text: "Someone mentions you in chat" },
];

export default async function ActivityPage({ params }: ActivityPageProps) {
    const { workspaceId } = await params;
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]);

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
        notFound();
    }

    const [activity, inbox] = await Promise.all([
        getWorkspaceActivity(workspaceId, ACTIVITY_FEED_LIMIT),
        getNotifications(ACTIVITY_FEED_LIMIT),
    ]);

    return (
        <main className="pb-24">
            <PageHeader
                eyebrow={`${workspace.name} — Activity`}
                serif="What"
                heavy="changed"
                description="Everything anyone has changed here, newest first."
            />

            <div
                className={cn(
                    PAGE_CONTAINER,
                    "flex flex-wrap items-start gap-6",
                )}
            >
                <div className="min-w-0 flex-[999_1_40rem]">
                    <ActivityFeed
                        workspaceId={workspaceId}
                        initialActivity={activity.map(toNotificationPayload)}
                        initialUnreadCount={inbox.unreadCount}
                    />
                </div>

                <aside
                    aria-labelledby="what-lands-here"
                    className="paddock-night min-w-0 flex-[1_1_21rem] rounded-paddock-panel p-5.5"
                >
                    <h2
                        id="what-lands-here"
                        className="m-0 mb-4 leading-[0.86]"
                    >
                        <span className="paddock-serif block text-[2rem] text-paddock-lime">
                            What
                        </span>{" "}
                        <span className="paddock-heavy block text-[1.75rem]">
                            lands here
                        </span>
                    </h2>
                    <ul className="m-0 flex list-none flex-col gap-3 p-0 text-sm">
                        {WHAT_LANDS_HERE.map(({ type, text }) => (
                            <li key={type} className="flex items-center gap-3">
                                <span
                                    aria-hidden="true"
                                    className="flex size-7.5 shrink-0 items-center justify-center rounded-paddock bg-paddock-night-card font-bold text-paddock-lime"
                                >
                                    {NOTIFICATION_TYPE_ICONS[type]}
                                </span>
                                {text}
                            </li>
                        ))}
                    </ul>
                </aside>
            </div>
        </main>
    );
}
