import { getWorkspace } from "@/features/workspace/queries/get-workspace";
import { notFound } from "next/navigation";

export default async function ChatPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    const workspace = await getWorkspace(workspaceId);

    if (!workspace) {
        notFound();
    }

    return (
        <main className="max-w-7xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between pb-6 border-b-2 border-brand-muted mb-8">
                <div>
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle">
                        Channels
                    </span>
                    <h1 className="text-3xl font-medium tracking-tight text-brand-ink mt-1">
                        Team Chat
                    </h1>
                </div>
            </div>

            <div className="flex flex-col items-center justify-center py-20 px-4 text-center border-2 border-dashed border-brand-border rounded-brand bg-brand-surface">
                <h3 className="text-lg font-medium text-brand-ink mb-2">
                    #general
                </h3>
                <p className="text-xs font-brand-mono text-brand-subtle max-w-sm mb-6">
                    Connect and message team members in {workspace.name}.
                </p>
            </div>
        </main>
    );
}
