import { notFound } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { ActivityFeed } from "@/features/notification/components/activity-feed";
import { toNotificationPayload } from "@/features/notification/lib/serialize";
import { getNotifications } from "@/features/notification/queries/get-notifications";
import { getWorkspaceActivity } from "@/features/notification/queries/get-workspace-activity";
import { ACTIVITY_FEED_LIMIT } from "@/features/notification/types";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ActivityPageProps {
    params: Promise<{ workspaceId: string }>;
}

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
        <main className="max-w-4xl mx-auto px-6 py-8">
            <PageHeader
                title="Activity"
                description="Everything anyone has changed here, newest first."
            />

            <ActivityFeed
                workspaceId={workspaceId}
                initialActivity={activity.map(toNotificationPayload)}
                initialUnreadCount={inbox.unreadCount}
            />
        </main>
    );
}
