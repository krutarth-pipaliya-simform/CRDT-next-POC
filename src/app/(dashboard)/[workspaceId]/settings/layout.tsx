import { verifyWorkspaceRole } from "@/features/workspace/lib/rbac";
import Link from "next/link";

export default async function SettingsLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;
    // Only Admin can access settings (FR-6)
    await verifyWorkspaceRole(workspaceId, ["ADMIN"]);

    const tabs = [
        { label: "General", href: `/${workspaceId}/settings` },
        { label: "Members", href: `/${workspaceId}/settings/members` },
        { label: "Billing", href: `/${workspaceId}/settings/billing` },
    ];

    return (
        <div className="max-w-4xl mx-auto px-6 py-10">
            <div className="mb-8">
                <h2 className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle mb-2">
                    Workspace Management
                </h2>
                <h1 className="text-3xl font-medium tracking-tight text-brand-ink">
                    Settings
                </h1>
            </div>

            <nav
                className="flex items-center gap-2 border-b-2 border-brand-muted mb-8"
                aria-label="Settings navigation tabs"
            >
                {tabs.map((tab) => (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className="px-4 py-2 font-brand-mono text-xs uppercase tracking-wider text-brand-subtle hover:text-brand-ink transition-colors border-b-2 border-transparent hover:border-brand-ink -mb-[2px]"
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>

            <div>{children}</div>
        </div>
    );
}
