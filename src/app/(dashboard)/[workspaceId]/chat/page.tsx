import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/layout/page-header";
import { auth } from "@/features/auth/lib/auth";
import { ChatPanel } from "@/features/chat/components/chat-panel";
import { getWorkspaceMessages } from "@/features/chat/queries/get-workspace-messages";
import {
    getWorkspaceRole,
    verifyWorkspaceRole,
} from "@/features/workspace/lib/rbac";
import { getWorkspace } from "@/features/workspace/queries/get-workspace";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export interface ChatPageProps {
    params: Promise<{ workspaceId: string }>;
}

export default async function ChatPage({ params }: ChatPageProps) {
    const { workspaceId } = await params;
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]);

    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
        notFound();
    }

    const role = await getWorkspaceRole(workspaceId);
    const canPost = role === "ADMIN" || role === "MEMBER";

    const messages = await getWorkspaceMessages(workspaceId);

    return (
        <main className="max-w-5xl mx-auto px-6 py-8">
            <PageHeader
                eyebrow="Channels"
                title="Team Chat"
                description={`Connect and message team members in ${workspace.name}.`}
            />

            <ChatPanel
                workspaceId={workspaceId}
                workspaceName={workspace.name}
                initialMessages={messages}
                currentUser={{
                    id: session.user.id,
                    name: session.user.name || session.user.email || "You",
                    email: session.user.email ?? null,
                    image: session.user.image ?? null,
                }}
                canPost={canPost}
            />
        </main>
    );
}
