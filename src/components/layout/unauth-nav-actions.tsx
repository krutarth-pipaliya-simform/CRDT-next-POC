"use client";

import { usePathname } from "next/navigation";
import { LinkButton } from "@/components/ui/link-button";

export function UnauthNavActions() {
    const pathname = usePathname();

    if (pathname === "/login") {
        return null;
    }

    return (
        <LinkButton href="/login" variant="primary" size="sm">
            Log In
        </LinkButton>
    );
}
