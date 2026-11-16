import type { Metadata } from "next";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import {
    AccessDenied,
    ForbiddenNumeral,
} from "@/features/auth/components/access-denied";
import { PublicScreen } from "@/features/auth/components/public-screen";

export const metadata: Metadata = {
    title: "Page not found",
};

/**
 * Any URL that matches no route, and any `notFound()` outside the signed-in
 * shell. There is no header here, so the ways out are spelled out.
 */
export default function NotFound() {
    return (
        <PublicScreen
            surface="night"
            align="start"
            decoration={
                <ForbiddenNumeral
                    numeral="404"
                    className="-right-8 hidden text-[28.75rem] lg:block"
                />
            }
        >
            <AccessDenied
                code="404 · Not found"
                serif="Page"
                heavy="not found"
                actions={
                    <>
                        <PaddockLinkButton
                            href="/dashboard"
                            size="lg"
                            surface="night"
                        >
                            Go to your workspaces
                        </PaddockLinkButton>
                        <PaddockLinkButton
                            href="/"
                            variant="outline"
                            size="lg"
                            surface="night"
                        >
                            Home
                        </PaddockLinkButton>
                    </>
                }
            >
                Nothing lives at this address. The link may be mistyped, or what
                it pointed to has been moved or deleted.
            </AccessDenied>
        </PublicScreen>
    );
}
