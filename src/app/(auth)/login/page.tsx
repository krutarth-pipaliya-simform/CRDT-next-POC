import { LoginForm } from "@/features/auth/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authenticate | CRDT-Next-POC",
    description: "Login to the CRDT workspace",
};

export default function LoginPage() {
    return <LoginForm />;
}
