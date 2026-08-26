"use client";

import { useActionState, useState } from "react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { createWorkspaceAction } from "@/features/workspace/actions/create-workspace";

export function CreateWorkspaceDialog() {
    const [open, setOpen] = useState(false);
    const [state, formAction] = useActionState(createWorkspaceAction, null);

    return (
        <>
            <Button onClick={() => setOpen(true)} withArrow>
                New Workspace
            </Button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
                title="Create Workspace"
            >
                <form action={formAction} className="flex flex-col gap-5">
                    <Input
                        id="name"
                        name="name"
                        label="Workspace Name"
                        placeholder="e.g. Acme Studio"
                        required
                        autoFocus
                    />
                    {state?.error && (
                        <Alert intent="danger">{state.error}</Alert>
                    )}
                    <div className="flex justify-end gap-3 pt-2">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" pendingText="Creating...">
                            Create
                        </Button>
                    </div>
                </form>
            </Dialog>
        </>
    );
}
