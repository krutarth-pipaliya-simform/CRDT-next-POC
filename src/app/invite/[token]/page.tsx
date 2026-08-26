import Link from "next/link";
import { redirect } from "next/navigation";

import { LinkButton } from "@/components/ui/link-button";
import { auth } from "@/features/auth/lib/auth";
import { JoinWorkspaceButton } from "@/features/workspace/components/join-workspace-button";
import { getInvitationByToken } from "@/features/workspace/queries/get-invitation";

export default async function InvitePage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = await params;
    const session = await auth();

    // If user is not logged in, redirect them to login and preserve destination
    if (!session?.user) {
        redirect(`/login?callbackUrl=/invite/${token}`);
    }

    const invitation = await getInvitationByToken(token);

    if (!invitation) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 bg-brand-surface">
                <div className="max-w-md w-full flex flex-col items-center text-center gap-6 p-8 border-2 border-brand-ink rounded-brand bg-brand-surface shadow-brand-card">
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-danger">
                        Invalid Link
                    </span>
                    <h1 className="text-2xl font-medium tracking-tight text-brand-ink">
                        Invitation Not Found
                    </h1>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        This invitation link is invalid or does not exist.
                        Please request a new invitation from your workspace
                        admin.
                    </p>
                    <LinkButton href="/dashboard" variant="primary" size="md">
                        Go to Dashboard
                    </LinkButton>
                </div>
            </main>
        );
    }

    const isExpired = invitation.expiresAt < new Date();
    const isUsed = !!invitation.usedAt;

    if (isExpired || isUsed) {
        return (
            <main className="min-h-screen flex items-center justify-center p-6 bg-brand-surface">
                <div className="max-w-md w-full flex flex-col items-center text-center gap-6 p-8 border-2 border-brand-danger rounded-brand bg-brand-surface shadow-brand-card">
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-danger">
                        {isExpired ? "Link Expired" : "Already Used"}
                    </span>
                    <h1 className="text-2xl font-medium tracking-tight text-brand-ink">
                        {isExpired
                            ? "This Invitation Has Expired"
                            : "This Invitation Has Already Been Used"}
                    </h1>
                    <p className="text-xs font-brand-mono text-brand-subtle">
                        {isExpired
                            ? "Workspace invitation links expire 24 hours after generation. Please ask the admin for a new link."
                            : "This invitation link was single-use and has already been redeemed."}
                    </p>
                    <LinkButton href="/dashboard" variant="secondary" size="md">
                        Return to Dashboard
                    </LinkButton>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center p-6 bg-brand-surface">
            <div className="max-w-md w-full flex flex-col gap-6 p-8 border-2 border-brand-ink rounded-brand bg-brand-surface shadow-brand-card animate-fade-in-up">
                <div className="border-b-2 border-brand-muted pb-4">
                    <span className="font-brand-mono text-xs uppercase tracking-widest text-brand-subtle">
                        Team Invitation
                    </span>
                    <h1 className="text-2xl font-medium tracking-tight text-brand-ink mt-1">
                        Join {invitation.workspace.name}
                    </h1>
                </div>

                <p className="text-sm text-brand-subtle">
                    You have been invited to collaborate in{" "}
                    <strong className="text-brand-ink">
                        {invitation.workspace.name}
                    </strong>{" "}
                    as a{" "}
                    <span className="font-brand-mono font-semibold">
                        Member
                    </span>
                    .
                </p>

                <div className="pt-2">
                    <JoinWorkspaceButton token={token} />
                </div>

                <div className="text-center pt-2">
                    <Link
                        href="/dashboard"
                        className="text-xs font-brand-mono text-brand-subtle hover:text-brand-ink underline underline-offset-4"
                    >
                        Decline and go to dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
