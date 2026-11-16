"use client";

import { RouteError } from "@/components/layout/route-error";

export interface ContentErrorProps {
    error: Error & { digest?: string };
    retry: () => void;
}

/** Errors in the public content sections. */
export default function ContentError({ error, retry }: ContentErrorProps) {
    return <RouteError error={error} retry={retry} />;
}
