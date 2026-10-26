import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { ContourBackground } from "@/components/paddock/contour-background";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import {
    AccessDenied,
    ForbiddenNumeral,
} from "@/features/auth/components/access-denied";

export default async function WorkspaceUnauthorizedPage({
    params,
}: {
    params: Promise<{ workspaceId: string }>;
}) {
    const { workspaceId } = await params;

    return (
        <main className={`${PAGE_CONTAINER} py-8 sm:py-12`}>
            {/* Inside the workspace shell, so the refusal is a night panel in
                the content column rather than a whole page. */}
            <section className="paddock-night relative overflow-hidden rounded-paddock-panel px-6 py-14 sm:px-12 sm:py-20">
                <ContourBackground pattern="band" surface="night" />
                <ForbiddenNumeral className="-right-6 hidden text-[18rem] lg:block" />
                <AccessDenied
                    code="403 · Restricted Area"
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
                </AccessDenied>
            </section>
        </main>
    );
}
