import type { Metadata } from "next";

import { RegisterForm } from "@/features/auth/components/register-form";

export const metadata: Metadata = {
    title: "Provision Account | CRDT-Next-POC",
    description: "Create an account for the CRDT workspace",
};

export default function RegisterPage() {
    return <RegisterForm />;
}
