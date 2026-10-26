"use client";

import { useActionState, useId } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockInput } from "@/components/paddock/paddock-field";
import { updateProfile } from "@/features/profile/actions/update-profile";

import { ProfileNotice, ProfileSection } from "./profile-section";

export interface ProfileFormProps {
    initialName?: string;
}

export function ProfileForm({ initialName }: ProfileFormProps) {
    const [state, action, isPending] = useActionState(updateProfile, null);
    const nameId = useId();

    return (
        <ProfileSection
            serif="Profile"
            heavy="information"
            description="Update your personal details here."
        >
            <form action={action} className="flex flex-col gap-4">
                <PaddockInput
                    id={nameId}
                    name="name"
                    label="Full Name"
                    defaultValue={initialName}
                    placeholder="John Doe"
                    autoComplete="name"
                />

                {state?.success && (
                    <ProfileNotice intent="success">
                        {state.data?.message}
                    </ProfileNotice>
                )}
                {!state?.success && state?.error && (
                    <ProfileNotice intent="danger">{state.error}</ProfileNotice>
                )}

                <div>
                    <PaddockButton type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Profile"}
                    </PaddockButton>
                </div>
            </form>
        </ProfileSection>
    );
}
