import type { Metadata } from "next";
import Link from "next/link";
import { z } from "zod";

import { AuthHeading } from "@/features/auth/components/auth-heading";
import { AuthNotice } from "@/features/auth/components/auth-notice";
import { AuthSplitScreen } from "@/features/auth/components/auth-split-screen";
import { AUTH_TEXT_LINK } from "@/features/auth/components/auth-styles";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getPasswordResetTokenStatus } from "@/features/auth/lib/password-reset-tokens";

export const metadata: Metadata = {
    title: "Choose a new password",
    // The token is in the address; keep it out of any Referer header.
    referrer: "no-referrer",
};

const searchParamsSchema = z.object({
    token: z
        .string()
        .regex(/^[a-f0-9]{64}$/)
        .optional()
        .catch(undefined),
});

const UNUSABLE_LINK = {
    invalid: "This reset link is invalid or has already been used.",
    expired: "This reset link has expired. Reset links last 1 hour.",
} as const;

export default async function ResetPasswordPage({
    searchParams,
}: {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
    const { token } = searchParamsSchema.parse(await searchParams);
    const status = token ? await getPasswordResetTokenStatus(token) : "invalid";

    return (
        <AuthSplitScreen>
            {token && status === "valid" ? (
                <ResetPasswordForm token={token} />
            ) : (
                <div className="flex flex-col">
                    <AuthHeading
                        serif="Link no longer"
                        heavy="works"
                        className="mb-6"
                    />
                    <AuthNotice tone="danger">
                        {status === "expired"
                            ? UNUSABLE_LINK.expired
                            : UNUSABLE_LINK.invalid}
                    </AuthNotice>
                    <p className="mt-7 mb-0 text-sm">
                        <Link
                            href="/forgot-password"
                            className={AUTH_TEXT_LINK}
                        >
                            Request a new link
                        </Link>
                    </p>
                </div>
            )}
        </AuthSplitScreen>
    );
}
