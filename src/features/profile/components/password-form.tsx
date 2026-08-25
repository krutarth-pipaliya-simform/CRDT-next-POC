"use client";

import { useActionState, useRef, useEffect } from "react";
import { updatePassword } from "../actions/update-password";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";

export function PasswordForm() {
    const [state, action] = useActionState(updatePassword, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success && formRef.current) {
            formRef.current.reset();
        }
    }, [state]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Change Password</CardTitle>
                    <p className="text-sm text-brand-ink/70 font-brand-sans">
                        Update your password to keep your account secure.
                    </p>
                </div>
            </CardHeader>
            <CardBody>
                <form action={action} ref={formRef} className="space-y-6">
                    {state?.success && (
                        <Alert intent="success">{state.data?.message}</Alert>
                    )}
                    {!state?.success && state?.error && (
                        <Alert intent="danger">{state.error}</Alert>
                    )}

                    <FormField
                        label="Current Password"
                        htmlFor="currentPassword"
                        required
                    >
                        <Input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            required
                        />
                    </FormField>

                    <FormField
                        label="New Password"
                        htmlFor="newPassword"
                        required
                    >
                        <Input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            required
                        />
                    </FormField>

                    <FormField
                        label="Confirm New Password"
                        htmlFor="confirmPassword"
                        required
                    >
                        <Input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            required
                        />
                    </FormField>

                    <Button type="submit" pendingText="Updating...">
                        Update Password
                    </Button>
                </form>
            </CardBody>
        </Card>
    );
}
