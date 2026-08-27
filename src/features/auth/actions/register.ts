"use server";

import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { headers } from "next/headers";

import { sendVerificationEmail } from "@/features/auth/lib/email";
import { generateVerificationToken } from "@/features/auth/lib/tokens";
import { db } from "@/lib/db";
import { registerSchema } from "@/schemas/auth";

export async function registerAction(state: unknown, formData: FormData) {
    try {
        const data = Object.fromEntries(formData.entries());
        const validated = registerSchema.safeParse(data);
        if (!validated.success) {
            return { error: "Invalid input" };
        }

        const { name, email, password } = validated.data;

        // Check if user already exists
        const existingUser = await db.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return { error: "Email already in use" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await db.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                // TODO(Tech-Debt): Remove hardcoded role when 'role' is removed from the User schema.
                // Users should receive their roles via WorkspaceMember records upon joining a workspace.
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

        const verifyUrl = `${appUrl}/verify-email?token=${verificationToken.token}`;

        await sendVerificationEmail(
            verificationToken.identifier,
            verificationToken.token,
            appUrl,
        );

        return {
            success: true,
            message: "Confirmation email sent! Please check your inbox.",
            verifyUrl:
                process.env.NODE_ENV !== "production" ||
                !process.env.EMAIL_SERVER_HOST
                    ? verifyUrl
                    : undefined,
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
