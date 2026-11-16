import type { Metadata } from "next";

import { AuthSplitScreen } from "@/features/auth/components/auth-split-screen";
import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
    title: "Create your account",
    description: "Create a Converge account",
};

export default function RegisterPage() {
    return (
        <AuthSplitScreen>
            <RegisterForm />
        </AuthSplitScreen>
    );
}
