import { LoginForm } from "@/features/auth/components/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Authenticate | CRDT-Next-POC",
    description: "Login to the CRDT workspace",
};

export default async function LoginPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Next.js 16 requires awaiting searchParams
    await searchParams;

    return <LoginForm />;
}
