import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { SentryTestPanel } from "./sentry-test-panel";

export const metadata: Metadata = {
    title: "Monitoring check",
};

/**
 * Development-only page for confirming Sentry receives errors from the
 * browser and from the server. Production answers 404.
 */
export default function SentryTestPage() {
    if (process.env.NODE_ENV === "production") {
        notFound();
    }

    return <SentryTestPanel />;
}
