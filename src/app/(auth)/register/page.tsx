import { RegisterForm } from "@/features/auth/components/register-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Provision Account | CRDT-Next-POC",
    description: "Create an account for the CRDT workspace",
};

export default async function RegisterPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
    // Next.js 16 requires awaiting searchParams
    await searchParams;

    return <RegisterForm />;
}
