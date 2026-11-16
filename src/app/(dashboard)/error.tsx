"use client";

import { RouteError } from "@/components/layout/route-error";

export interface DashboardErrorProps {
    error: Error & { digest?: string };
    retry: () => void;
}

/** Errors in the dashboard, profile, or a workspace's own layout. */
export default function DashboardError({ error, retry }: DashboardErrorProps) {
    return <RouteError error={error} retry={retry} />;
}
