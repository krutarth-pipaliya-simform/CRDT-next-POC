"use client";

import { useState } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";

/** Runs in the browser: each button produces one kind of error. */
export function SentryTestPanel() {
    const [serverStatus, setServerStatus] = useState<string | null>(null);
    const [renderFailure, setRenderFailure] = useState(false);

    if (renderFailure) {
        throw new Error("Sentry verification: client render error");
    }

    async function triggerServerError() {
        setServerStatus("Requesting...");
        try {
            const response = await fetch("/api/sentry-test");
            setServerStatus(`The route answered ${response.status}.`);
        } catch {
            setServerStatus("The request failed before an answer arrived.");
        }
    }

    return (
        <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 py-16">
            <h1 className="text-2xl font-semibold text-paddock-ink">
                Monitoring check
            </h1>
            <p className="text-paddock-subtle">
                Each button throws on purpose. With a DSN configured, the event
                appears in Sentry within a minute; without one nothing is sent.
            </p>
            <div className="flex flex-wrap gap-3">
                <PaddockButton
                    onClick={() => {
                        throw new Error(
                            "Sentry verification: client event handler error",
                        );
                    }}
                >
                    Throw a client error
                </PaddockButton>
                <PaddockButton
                    variant="outline"
                    onClick={() => setRenderFailure(true)}
                >
                    Throw while rendering
                </PaddockButton>
                <PaddockButton variant="outline" onClick={triggerServerError}>
                    Throw a server error
                </PaddockButton>
            </div>
            {serverStatus ? (
                <p role="status" className="paddock-mono text-sm">
                    {serverStatus}
                </p>
            ) : null}
        </main>
    );
}
