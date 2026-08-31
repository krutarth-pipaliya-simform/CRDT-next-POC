import { notFound, redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { CollaborativeEditor } from "@/features/document/components/editor-wrapper";
import { getDocument } from "@/features/document/queries/get-document";
import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DocumentEditorPage({
    params,
}: {
    params: Promise<{ workspaceId: string; documentId: string }>;
}) {
    const { workspaceId, documentId } = await params;
    await verifyWorkspaceRole(workspaceId, ["ADMIN", "MEMBER", "GUEST"]);

    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const document = await getDocument(workspaceId, documentId);
    if (!document) {
        notFound();
    }

    return (
        <main className="w-full min-h-[calc(100vh-4rem)] bg-brand-surface overflow-x-hidden min-w-0">
            <CollaborativeEditor
                document={document}
                workspaceId={workspaceId}
                currentUser={{
                    id: session.user.id,
                    name: session.user.name || "Anonymous Collaborator",
                    image: session.user.image,
                }}
            />
        </main>
    );
}
