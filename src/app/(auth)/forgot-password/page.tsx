import type { Metadata } from "next";

import { AuthSplitScreen } from "@/features/auth/components/auth-split-screen";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";

export const metadata: Metadata = {
    title: "Forgot password",
    description: "Reset the password for your Converge account",
};

export default function ForgotPasswordPage() {
    return (
        <AuthSplitScreen>
            <ForgotPasswordForm />
        </AuthSplitScreen>
    );
}
