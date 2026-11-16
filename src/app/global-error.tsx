"use client";

import { useEffect } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockRoot } from "@/components/paddock/paddock-root";
import { paddockButtonClasses } from "@/components/paddock/paddock-styles";
import { AccessDenied } from "@/features/auth/components/access-denied";
import { reportBoundaryError } from "@/lib/report-error";
import { THEME_INIT_SCRIPT } from "@/lib/theme";

import "./globals.css";

export interface GlobalErrorProps {
    error: Error & { digest?: string };
    retry: () => void;
}

/**
 * The last boundary: it replaces the root layout, so it brings its own
 * document, the global stylesheet and the theme script. The two display
 * faces come from the root layout and are absent here, so the headline falls
 * back to the system stack; everything else is the Paddock night panel.
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
    useEffect(() => {
        console.error(error);
        reportBoundaryError(error, "global-error-boundary");
    }, [error]);

    return (
        <html lang="en" data-theme="light" suppressHydrationWarning>
            <head>
                <title>Something went wrong · Converge</title>
                <script
                    dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
                />
            </head>
            <body>
                <PaddockRoot className="flex items-center justify-center p-6">
                    <section className="paddock-night w-full max-w-[56rem] rounded-paddock-panel px-6 py-14 sm:px-12 sm:py-20">
                        <AccessDenied
                            code={
                                error.digest
                                    ? `Error · Reference ${error.digest}`
                                    : "Error · Something broke"
                            }
                            serif="Something"
                            heavy="went wrong"
                            actions={
                                <>
                                    <PaddockButton
                                        size="lg"
                                        surface="night"
                                        onClick={retry}
                                    >
                                        Try again
                                    </PaddockButton>
                                    {/* A plain anchor on purpose: the app router
                                        may be what broke, and a full page load
                                        resets it. */}
                                    {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                                    <a
                                        href="/dashboard"
                                        className={paddockButtonClasses({
                                            variant: "outline",
                                            size: "lg",
                                            surface: "night",
                                        })}
                                    >
                                        Go to the dashboard
                                    </a>
                                </>
                            }
                        >
                            The app hit an error it could not recover from.
                            Trying again often works; if it keeps happening, the
                            reference above helps track it down.
                        </AccessDenied>
                    </section>
                </PaddockRoot>
            </body>
        </html>
    );
}
