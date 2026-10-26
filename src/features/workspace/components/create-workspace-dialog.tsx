"use client";

import { useActionState, useEffect, useId, useState } from "react";

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
                        <PaddockInput
                            id={inputId}
                            name="name"
                            label="Workspace Name"
                            placeholder="e.g. Acme Studio"
                            hint="Between 2 and 50 characters."
                            error={state?.error ?? undefined}
                            required
                        />
                    </form>
                ) : null}
            </PaddockDialog>
        </>
    );
}
