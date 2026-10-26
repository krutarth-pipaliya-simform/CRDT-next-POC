import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { NotchedCard } from "@/components/paddock/notched-card";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { Tag } from "@/components/paddock/tag";
import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AUTH_TEXT_LINK } from "@/features/auth/components/auth-styles";
import { PublicScreen } from "@/features/auth/components/public-screen";
import { auth } from "@/features/auth/lib/auth";
import { JoinWorkspaceButton } from "@/features/workspace/components/join-workspace-button";
import { getInvitationByToken } from "@/features/workspace/queries/get-invitation";
import { cn } from "@/lib/cn";

const MINUTE_MS = 60_000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** "23 h", "40 min", "2 d" — a duration, for the expiry line under the card. */
function formatSpan(ms: number): string {
    if (ms < HOUR_MS) return `${Math.max(1, Math.round(ms / MINUTE_MS))} min`;
    if (ms < DAY_MS) return `${Math.round(ms / HOUR_MS)} h`;
    return `${Math.round(ms / DAY_MS)} d`;
}

interface InviteCardProps {
    tag: string;
    serif: string;
    heavy: string;
    /** Real data (the expiry), set in mono in the card's raised tab. */
    meta: string;
    body: ReactNode;
    children: ReactNode;
}

/** The invitation on a night ground: one notched sheet, its expiry in the tab. */
function InviteCard({
    tag,
    serif,
    heavy,
    meta,
    body,
    children,
}: InviteCardProps) {
    return (
        <PublicScreen surface="night">
            <NotchedCard
                className="w-full max-w-[38.75rem]"
                bodyClassName="flex flex-col gap-4.5 px-6 pt-10 pb-[4.75rem] sm:px-13 sm:pt-13"
                tab={
                    <span className="paddock-mono text-[0.71875rem] font-normal normal-case">
                        {meta}
                    </span>
                }
            >
                <Tag as="p">{tag}</Tag>
                <AuthHeading serif={serif} heavy={heavy} />
                <p className="m-0 max-w-[28.75rem] text-base text-paddock-subtle">
                    {body}
                </p>
                {children}
            </NotchedCard>
        </PublicScreen>
    );
}

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
            <InviteCard
                tag="Invalid link"
                serif="Invitation"
                heavy="Not Found"
                meta="unknown link"
                body="This invitation link is invalid or no longer exists. Ask your workspace admin for a new one."
            >
                <PaddockLinkButton
                    href="/dashboard"
                    variant="outline"
                    className="mt-1.5 self-start"
                >
                    Go to dashboard
                </PaddockLinkButton>
            </InviteCard>
        );
    }

    const now = new Date();
    const isExpired = invitation.expiresAt < now;
    const isUsed = !!invitation.usedAt;
    const remaining = invitation.expiresAt.getTime() - now.getTime();

    if (isExpired || isUsed) {
        return (
            <InviteCard
                tag={isExpired ? "Link expired" : "Already used"}
                serif="This Invitation"
                heavy={isExpired ? "Has Expired" : "Has Already Been Used"}
                meta={
                    isExpired
                        ? `expired ${formatSpan(-remaining)} ago`
                        : "single-use link"
                }
                body={
                    isExpired
                        ? "Invitation links expire 24 hours after they are made. Ask the workspace admin for a new one."
                        : "This invitation link worked once and has already been used."
                }
            >
                <PaddockLinkButton
                    href="/dashboard"
                    variant="outline"
                    className="mt-1.5 self-start"
                >
                    Return to dashboard
                </PaddockLinkButton>
            </InviteCard>
        );
    }

    return (
        <InviteCard
            tag="Team invitation"
            serif="Join"
            heavy={invitation.workspace.name}
            meta={`expires in ${formatSpan(remaining)}`}
            body={
                <>
                    You have been invited to collaborate in{" "}
                    <strong className="text-paddock-ink">
                        {invitation.workspace.name}
                    </strong>{" "}
                    as a <strong className="text-paddock-ink">Member</strong>.
                </>
            }
        >
            <div className="mt-1.5 flex flex-col items-start gap-5">
                <JoinWorkspaceButton token={token} />
                <Link
                    href="/dashboard"
                    className={cn(
                        AUTH_TEXT_LINK,
                        "inline-flex min-h-11 items-center font-semibold",
                    )}
                >
                    Decline and go to dashboard
                </Link>
            </div>
        </InviteCard>
    );
}
