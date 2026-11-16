"use client";

import { useEffect } from "react";

import {
    PaddockButton,
    PaddockLinkButton,
} from "@/components/paddock/paddock-button";
import { reportBoundaryError } from "@/lib/report-error";

import { ShellNotice } from "./shell-notice";

export interface RouteErrorProps {
    error: Error & { digest?: string };
    retry: () => void;
    /** Inside a workspace, offers its overview as a way out too. */
    workspaceId?: string | null;
}

/**
 * The body of an `error.tsx` boundary inside the shell: try again, or leave
 * by a real link. The message is never shown, since a server error's message
 * is generic in production; the digest matches the server log instead.
 */
export function RouteError({ error, retry, workspaceId }: RouteErrorProps) {
    useEffect(() => {
        console.error(error);
        reportBoundaryError(error, "route-error-boundary");
    }, [error]);

    return (
        <ShellNotice
            code={
                error.digest
                    ? `Error · Reference ${error.digest}`
                    : "Error · Something broke"
            }
            numeral="500"
            serif="Something"
            heavy="went wrong"
            actions={
                <>
                    <PaddockButton size="lg" surface="night" onClick={retry}>
                        Try again
                    </PaddockButton>
                    {workspaceId ? (
                        <PaddockLinkButton
                            href={`/${workspaceId}`}
                            variant="outline"
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
            This page could not be loaded. Trying again often works; if it keeps
            happening, the reference above helps track it down.
        </ShellNotice>
    );
}
