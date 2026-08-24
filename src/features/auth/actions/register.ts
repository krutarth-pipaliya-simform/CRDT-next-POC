"use server";

import { registerSchema } from "@/schemas/auth";
import { rawDb } from "@/lib/db";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { Role } from "@prisma/client";

import { generateVerificationToken } from "@/features/auth/lib/tokens";
import { sendVerificationEmail } from "@/features/auth/lib/email";
import { headers } from "next/headers";

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
                role: Role.MEMBER,
                // Email is not verified by default
            },
        });

        // Generate verification token and send email
        const verificationToken = await generateVerificationToken(email);

        const headersList = await headers();
        const host = headersList.get("host") || "localhost:3000";
        const protocol =
            headersList.get("x-forwarded-proto") ??
            (host.startsWith("localhost") ? "http" : "https");
        const appUrl = `${protocol}://${host}`;

        await sendVerificationEmail(
            verificationToken.identifier,
            verificationToken.token,
            appUrl,
        );

        return {
            success: true,
            message: "Confirmation email sent! Please check your inbox.",
        };
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
