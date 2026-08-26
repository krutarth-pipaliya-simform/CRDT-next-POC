"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/features/auth/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";
import { loginSchema } from "@/schemas/auth";

export async function loginAction(state: unknown, formData: FormData) {
    const data = Object.fromEntries(formData.entries());
    const validated = loginSchema.safeParse(data);
    if (!validated.success) {
        return { error: "Invalid input" };
    }

    const { email, password } = validated.data;
    const callbackUrl =
        (formData.get("callbackUrl") as string) || DEFAULT_LOGIN_REDIRECT;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: callbackUrl,
        });

        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        if (error instanceof AuthError) {
            // NextAuth v5 can wrap the error
            const cause = error.cause?.err?.message;
            if (cause === "email_not_verified") {
                return { error: "unverified", unverifiedEmail: email };
            }

            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Invalid email or password" };
                default:
                    // Try to match the message if not in cause
                    if (
                        error.message.includes("email_not_verified") ||
                        (error as AuthError).cause?.err?.message ===
                            "email_not_verified"
                    ) {
                        return { error: "unverified", unverifiedEmail: email };
                    }
                    return { error: "Something went wrong" };
            }
        }

        return { error: "An unexpected error occurred" };
    }
}
