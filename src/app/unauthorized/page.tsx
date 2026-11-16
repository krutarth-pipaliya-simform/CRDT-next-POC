import type { Metadata } from "next";

import { PaddockLinkButton } from "@/components/paddock/paddock-button";
import {
    AccessDenied,
    ForbiddenNumeral,
} from "@/features/auth/components/access-denied";
import { PublicScreen } from "@/features/auth/components/public-screen";

export const metadata: Metadata = {
    title: "Access denied",
};

export default function UnauthorizedPage() {
    return (
        <PublicScreen
            surface="night"
            align="start"
            decoration={
                <ForbiddenNumeral className="-right-8 hidden text-[28.75rem] lg:block" />
            }
        >
            <AccessDenied
                code="403 · Access Denied"
                serif="Unauthorized"
                heavy="Access"
                actions={
                    <PaddockLinkButton
                        href="/dashboard"
                        size="lg"
                        surface="night"
                    >
                        Return to dashboard
                    </PaddockLinkButton>
                }
            >
                You do not have permission to open this private workspace or
                resource. If you were a member before, your access may have been
                removed or the workspace made private.
            </AccessDenied>
        </PublicScreen>
    );
}
