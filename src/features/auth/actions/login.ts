"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

import { signIn } from "@/features/auth/lib/auth";
import { DEFAULT_LOGIN_REDIRECT } from "@/lib/routes";
import { loginSchema } from "@/schemas/auth";

export type LoginActionResult =
    | { success: true; error?: never; unverifiedEmail?: never }
    | { success?: false; error: "unverified"; unverifiedEmail: string }
    | { success?: false; error: string; unverifiedEmail?: never };

function getCauseErrorMessage(error: AuthError): string | undefined {
    const cause = error.cause;
    if (
        typeof cause === "object" &&
        cause !== null &&
        "err" in cause &&
        typeof cause.err === "object" &&
        cause.err !== null &&
        "message" in cause.err &&
        typeof cause.err.message === "string"
    ) {
        return cause.err.message;
    }
    return undefined;
}

export async function loginAction(
    state: unknown,
    formData: FormData,
): Promise<LoginActionResult> {
    const data = Object.fromEntries(formData.entries());
    const validated = loginSchema.safeParse(data);
    if (!validated.success) {
        return { error: "Invalid input" };
    }

    const { email, password } = validated.data;
    const rawCallbackUrl = formData.get("callbackUrl");
    const callbackUrl =
        typeof rawCallbackUrl === "string" && rawCallbackUrl
            ? rawCallbackUrl
            : DEFAULT_LOGIN_REDIRECT;

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
            const cause = getCauseErrorMessage(error);
            if (
                cause === "email_not_verified" ||
                error.message.includes("email_not_verified")
            ) {
                return { error: "unverified", unverifiedEmail: email };
            }

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
