import type { ReactNode } from "react";
import Link from "next/link";

import { ContourBackground } from "@/components/paddock/contour-background";
import { Wordmark } from "@/components/paddock/wordmark";
import { cn } from "@/lib/cn";

export interface PublicScreenProps {
    children: ReactNode;
    /** Paper for good news and forms; night for invitations and refusals. */
    surface?: "paper" | "night";
    /** `center` for a single card, `start` for a left-aligned statement. */
    align?: "center" | "start";
    /** Decorative layer drawn behind the content, e.g. the outlined 403. */
    decoration?: ReactNode;
}

/**
 * The full-page shell for public, single-purpose screens (verify email,
 * invitations, access denied): the wordmark home link, contour lines, and
 * one centred piece of content.
 */
export function PublicScreen({
    children,
    surface = "paper",
    align = "center",
    decoration,
}: PublicScreenProps) {
    return (
        <div
            className={cn(
                "relative flex min-h-screen w-full flex-col overflow-hidden",
                surface === "night" ? "paddock-night" : "bg-paddock-paper",
            )}
        >
            <ContourBackground pattern="band" surface={surface} />
            {decoration}

            <header className="relative px-4 py-7 sm:px-8">
                <Link
                    href="/"
                    aria-label="Converge home"
                    className="block w-fit no-underline"
                >
                    <Wordmark surface={surface} />
                </Link>
            </header>

            <main
                className={cn(
                    "relative flex flex-1 px-4",
                    align === "center"
                        ? "flex-col items-center justify-center pb-16 sm:px-6"
                        : "items-center pb-18 sm:px-8",
                )}
            >
                {children}
            </main>
        </div>
    );
}
