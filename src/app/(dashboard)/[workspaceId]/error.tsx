"use client";

import { useParams } from "next/navigation";

import { RouteError } from "@/components/layout/route-error";

export interface WorkspaceErrorProps {
    error: Error & { digest?: string };
    retry: () => void;
}

/** Errors in a workspace page. Rendered inside the workspace shell. */
export default function WorkspaceError({ error, retry }: WorkspaceErrorProps) {
    const params = useParams();
    const workspaceId =
        typeof params.workspaceId === "string" ? params.workspaceId : null;

    return <RouteError error={error} retry={retry} workspaceId={workspaceId} />;
}
