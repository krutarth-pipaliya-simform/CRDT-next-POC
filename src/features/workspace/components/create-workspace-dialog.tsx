"use client";

import { useActionState, useEffect, useId, useState } from "react";
import Link from "next/link";
import { CircleAlert } from "lucide-react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import { PaddockInput } from "@/components/paddock/paddock-field";
import { createWorkspaceAction } from "@/features/workspace/actions/create-workspace";

export function CreateWorkspaceDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction, isPending] = useActionState(
        createWorkspaceAction,
        null,
    );
    const formId = useId();
    const inputId = useId();

    // The dialog opens in its own effect (a child runs first), so focusing
    // here lands after `showModal()` has picked its own default.
    useEffect(() => {
        if (open) document.getElementById(inputId)?.focus();
    }, [open, inputId]);

    return (
        <>
            <PaddockButton size="md" onClick={() => setOpen(true)}>
                New Workspace
            </PaddockButton>
            {/* The body renders only while open: the empty dashboard shows
                this dialog twice, and a hidden copy of the field would make
                its label ambiguous. */}
            <PaddockDialog
                open={open}
                onClose={() => setOpen(false)}
                titleSerif="Create"
                titleHeavy="Workspace"
                className="w-[30rem]"
                footer={
                    open ? (
                        <>
                            <PaddockButton
                                variant="outline"
                                voice="plain"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </PaddockButton>
                            <PaddockButton
                                type="submit"
                                form={formId}
                                disabled={isPending}
                            >
                                {isPending ? "Creating..." : "Create"}
                            </PaddockButton>
                        </>
                    ) : null
                }
            >
                {open ? (
                    <form
                        id={formId}
                        action={formAction}
                        className="flex flex-col gap-5 pt-1"
                    >
                        {state && state.field === null ? (
                            <div
                                role="alert"
                                data-testid="create-workspace-error"
                                className="flex items-start gap-3 rounded-paddock border-[1.5px] border-paddock-danger px-4 py-3 text-sm font-semibold text-paddock-danger"
                            >
                                <CircleAlert
                                    aria-hidden="true"
                                    className="mt-0.5 size-4.5 shrink-0"
                                    strokeWidth={2}
                                />
                                <span className="min-w-0">
                                    {state.error}
                                    {state.sessionEnded ? (
                                        <>
                                            {" "}
                                            <Link
                                                href="/login?callbackUrl=%2Fdashboard"
                                                className="text-paddock-ink underline decoration-[1.5px] underline-offset-[3px]"
                                            >
                                                Log in
                                            </Link>
                                        </>
                                    ) : null}
                                </span>
                            </div>
                        ) : null}
                        {/* React resets the form after the action, which
                            restores each field to its default, so the default
                            is what was typed and survives a failed submit.
                            No remount: focus stays where the user left it. */}
                        <PaddockInput
                            id={inputId}
                            name="name"
                            label="Workspace Name"
                            placeholder="e.g. Acme Studio"
                            hint="Between 2 and 50 characters."
                            defaultValue={state?.name}
                            error={
                                state?.field === "name"
                                    ? state.error
                                    : undefined
                            }
                            required
                        />
                    </form>
                ) : null}
            </PaddockDialog>
        </>
    );
}
