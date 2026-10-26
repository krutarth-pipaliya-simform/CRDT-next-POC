import type { ReactNode } from "react";

export interface AuthLayoutProps {
    children: ReactNode;
}

/**
 * The auth pages do not share one frame: sign in and sign up use the split
 * screen (`<AuthSplitScreen>`), while verify-email is a single centred card
 * (`<PublicScreen>`). Each page picks its own, so this layout adds nothing.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
    return children;
}
