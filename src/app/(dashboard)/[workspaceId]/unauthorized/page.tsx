import { ShellNotice } from "@/components/layout/shell-notice";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";

export default async function WorkspaceUnauthorizedPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    return (
        <ShellNotice
            code="403 · Restricted Area"
            numeral="403"
            serif="Permission"
            heavy="Required"
            actions={
                <>
                    <PaddockLinkButton
                        href={`/${workspaceId}`}
                        size="lg"
                        surface="night"
                    >
                        Return to workspace
                    </PaddockLinkButton>
                    <PaddockLinkButton
                        href="/dashboard"
                        variant="outline"
                        size="lg"
                        surface="night"
                    >
                        Go to dashboard
                    </PaddockLinkButton>
                </>
            }
        >
            You do not have the required role to access this section in
            workspace{" "}
            <span className="paddock-mono break-all text-paddock-night-fg">
                {workspaceId}
            </span>
            . Ask an admin to change your role if you need it.
        </ShellNotice>
    );
}
