import Link from "next/link";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import { Wordmark } from "@/components/paddock/wordmark";
import { ThemeToggle } from "@/components/ui/theme-toggle";

import { MergeGlyph } from "./merge-glyph";

export interface LandingHeaderProps {
    /** A signed-in visitor gets one way back in instead of two ways to join. */
    signedIn: boolean;
}

/**
 * The landing page's own top bar: wordmark, the merge mark, then the way in.
 * The theme control stays visible in the chrome rather than behind a menu,
 * because a first-time visitor has no menu to open yet.
 */
export function LandingHeader({ signedIn }: LandingHeaderProps) {
    return (
        <header className="sticky top-0 z-40 border-b border-paddock-rule bg-paddock-paper">
            <div className="relative flex items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
                <Link
                    href="/"
                    aria-label="Converge home"
                    className="shrink-0 no-underline"
                >
                    <Wordmark />
                </Link>

                <MergeGlyph className="absolute top-1/2 left-1/2 hidden size-[2.125rem] -translate-x-1/2 -translate-y-1/2 text-paddock-ink lg:block" />

                <div className="flex min-w-0 items-center gap-2.5">
                    <ThemeToggle className="hidden sm:inline-flex" />
                    {signedIn ? (
                        <PaddockLinkButton href="/dashboard" size="sm">
                            {/* The full phrase does not fit beside the
                                wordmark on a 320px screen. */}
                            <span className="hidden sm:inline">Open your </span>
                            workspace
                        </PaddockLinkButton>
                    ) : (
                        <>
                            <PaddockLinkButton
                                href="/login"
                                variant="outline"
                                size="sm"
                                className="hidden sm:inline-flex"
                            >
                                Log in
                            </PaddockLinkButton>
                            <PaddockLinkButton href="/register" size="sm">
                                Start writing
                            </PaddockLinkButton>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
