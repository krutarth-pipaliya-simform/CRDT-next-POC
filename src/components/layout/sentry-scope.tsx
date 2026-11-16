"use client";

import { useEffect } from "react";
import { setTag, setUser } from "@sentry/nextjs";

export interface SentryScopeProps {
    /** The signed-in user's id. Never pass an email or a name. */
    userId?: string;
    /** The workspace being viewed. */
    workspaceId?: string;
}

/**
 * Tells Sentry who is looking and at which workspace, so an error can be
 * traced to an account without carrying any personal data: the user is the
 * opaque id only. Renders nothing, and does nothing without a DSN.
 */
export function SentryScope({ userId, workspaceId }: SentryScopeProps) {
    useEffect(() => {
        if (!userId) return;
        setUser({ id: userId });
        return () => setUser(null);
    }, [userId]);

    useEffect(() => {
        if (!workspaceId) return;
        setTag("workspace_id", workspaceId);
        return () => setTag("workspace_id", undefined);
    }, [workspaceId]);

    return null;
}
