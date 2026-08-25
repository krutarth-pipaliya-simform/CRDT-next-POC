"use client";

import { useActionState } from "react";
import { updateProfile } from "../actions/update-profile";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileForm({ initialName }: { initialName?: string }) {
    const [state, action] = useActionState(updateProfile, null);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <p className="text-sm text-brand-ink/70 font-brand-sans">
                    Update your personal details here.
                </p>
            </CardHeader>
            <CardBody>
                <form action={action} className="space-y-6">
                    {state?.success && (
                        <Alert intent="success">{state.data?.message}</Alert>
                    )}
                    {!state?.success && state?.error && (
                        <Alert intent="danger">{state.error}</Alert>
                    )}

                    <FormField label="Full Name" htmlFor="name">
                        <Input
                            name="name"
                            id="name"
                            defaultValue={initialName}
                            placeholder="John Doe"
                        />
                    </FormField>

                    <Button type="submit" pendingText="Saving...">
                        Save Profile
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
}
