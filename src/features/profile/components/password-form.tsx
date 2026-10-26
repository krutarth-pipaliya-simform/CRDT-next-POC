"use client";

import { useActionState, useEffect, useId, useRef } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { paddockFieldClasses } from "@/components/paddock/paddock-styles";
import { updatePassword } from "@/features/profile/actions/update-password";
import { cn } from "@/lib/cn";

import { ProfileNotice, ProfileSection } from "./profile-section";

interface NightPasswordFieldProps {
    id: string;
    name: string;
    label: string;
    autoComplete: string;
}

/**
 * A required password field for the night band. `PaddockInput` labels in ink,
 * which would vanish on night in the light theme, so the label here is set in
 * the night foreground; the field itself keeps the shared Paddock body.
 */
function NightPasswordField({
    id,
    name,
    label,
    autoComplete,
}: NightPasswordFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <label
                htmlFor={id}
                className="w-fit text-sm font-semibold text-paddock-night-fg"
            >
                {label}{" "}
                <span aria-hidden="true" className="text-paddock-lime">
                    *
                </span>
            </label>
            <input
                id={id}
                name={name}
                type="password"
                required
                autoComplete={autoComplete}
                className={cn(paddockFieldClasses, "h-13")}
            />
        </div>
    );
}

export function PasswordForm() {
    const [state, action, isPending] = useActionState(updatePassword, null);
    const formRef = useRef<HTMLFormElement>(null);
    const idBase = useId();

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
        }
    }, [state]);

    return (
        <ProfileSection
            tone="night"
            serif="Change"
            heavy="password"
            description="Update your password to keep your account secure."
        >
            <form action={action} ref={formRef} className="flex flex-col gap-4">
                {state?.success && (
                    <ProfileNotice intent="success">
                        {state.data?.message}
                    </ProfileNotice>
                )}
                {!state?.success && state?.error && (
                    <ProfileNotice intent="danger">{state.error}</ProfileNotice>
                )}

                <NightPasswordField
                    id={`${idBase}-current`}
                    name="currentPassword"
                    label="Current Password"
                    autoComplete="current-password"
                />
                <NightPasswordField
                    id={`${idBase}-new`}
                    name="newPassword"
                    label="New Password"
                    autoComplete="new-password"
                />
                <NightPasswordField
                    id={`${idBase}-confirm`}
                    name="confirmPassword"
                    label="Confirm New Password"
                    autoComplete="new-password"
                />

                <div>
                    <PaddockButton
                        type="submit"
                        surface="night"
                        disabled={isPending}
                    >
                        {isPending ? "Updating..." : "Update Password"}
                    </PaddockButton>
                </div>
            </form>
        </ProfileSection>
    );
}
