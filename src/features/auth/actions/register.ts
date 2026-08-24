"use server";

import { signIn } from "@/features/auth/lib/auth";
import { registerSchema } from "@/schemas/auth";
import { rawDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";

export async function registerAction(state: unknown, formData: FormData) {
    try {
        const data = Object.fromEntries(formData.entries());
        const validated = registerSchema.safeParse(data);
        if (!validated.success) {
            return { error: "Invalid input" };
        }

        const { name, email, password } = validated.data;

        // Check if user already exists
        const existingUser = await rawDb.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "Email already in use" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await rawDb.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                emailVerified: new Date(),
            },
        });

        await signIn("credentials", {
            email,
            password,
            redirectTo: "/",
        });

        return { success: true };
    } catch (error) {
        if (isRedirectError(error)) {
            throw error;
        }

        if (error instanceof AuthError) {
            return {
                error: "Failed to automatically sign in after registration",
            };
        }

        return { error: "An unexpected error occurred" };
    }
}
