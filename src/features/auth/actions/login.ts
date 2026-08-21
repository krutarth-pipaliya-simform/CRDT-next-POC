"use server";

import { signIn } from "@/features/auth/lib/auth";
import { loginSchema } from "@/schemas/auth";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function loginAction(state: unknown, formData: FormData) {
    try {
        const data = Object.fromEntries(formData.entries());
        const validated = loginSchema.safeParse(data);
        if (!validated.success) {
            return { error: "Invalid input" };
        }

        await signIn("credentials", {
            email: validated.data.email,
            password: validated.data.password,
            redirectTo: "/",
        });

        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" };
                default:
                    return { error: "Something went wrong" };
            }
        }

        return { error: "An unexpected error occurred" };
    }
}
