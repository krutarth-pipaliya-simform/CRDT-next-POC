"use client";

import { useParams } from "next/navigation";

import { ShellNotice } from "@/components/layout/shell-notice";
import { PaddockLinkButton } from "@/components/paddock/paddock-button";

/**
 * A `notFound()` from a page inside a workspace that does exist: a deleted
 * document, a stale notification link. Rendered inside the workspace shell,
 * so the section tabs stay. A client component because not-found files are
 * not given `params`.
 */
export default function WorkspaceNotFound() {
    const params = useParams();
    const workspaceId =
        typeof params.workspaceId === "string" ? params.workspaceId : null;

    return (
        <ShellNotice
            code="404 · Not found"
            numeral="404"
            serif="Nothing"
            heavy="here"
            actions={
                <>
                    {workspaceId ? (
                        <PaddockLinkButton
                            href={`/${workspaceId}`}
                            size="lg"
                            surface="night"
                        >
                            Back to the overview
                        </PaddockLinkButton>
                    ) : null}
                    <PaddockLinkButton
                        href="/dashboard"
                        variant="outline"
                        size="lg"
                        surface="night"
                    >
                        All workspaces
                    </PaddockLinkButton>
                </>
            }
        >
            This page is not in the workspace. It may have been deleted, or the
            link is out of date.
        </ShellNotice>
    );
}
