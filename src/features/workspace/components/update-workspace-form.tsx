"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockInput } from "@/components/paddock/paddock-field";
import {
    RadioCardGroup,
    type RadioCardOption,
} from "@/components/paddock/radio-card-group";
import { updateWorkspaceAction } from "@/features/workspace/actions/update-workspace";
import { WorkspaceVisibility } from "@/schemas/workspace";

export interface UpdateWorkspaceFormProps {
    workspaceId: string;
    initialName: string;
    initialVisibility?: WorkspaceVisibility;
}

const VISIBILITY_OPTIONS: RadioCardOption[] = [
    {
        value: WorkspaceVisibility.PRIVATE,
        label: "Private",
        badge: "Restricted",
        description: "Only people you invite can see and open this workspace.",
    },
    {
        value: WorkspaceVisibility.PUBLIC,
        label: "Public",
        badge: "Open",
        description: "Anyone can find this workspace, join it and collaborate.",
    },
];

/**
 * Name and visibility. Visibility is a pair of native radios (as notched
 * cards), so the choice is submitted with the form and needs no hidden input.
 */
export function UpdateWorkspaceForm({
    workspaceId,
    initialName,
    initialVisibility = WorkspaceVisibility.PRIVATE,
}: UpdateWorkspaceFormProps) {
    const boundUpdateAction = updateWorkspaceAction.bind(null, workspaceId);
    const [state, formAction, isPending] = useActionState(
        boundUpdateAction,
        null,
    );

    return (
        <form action={formAction} className="flex flex-col gap-6.5">
            <PaddockInput
                id="name"
                name="name"
                label="Workspace name"
                hint="2 to 50 characters. Everyone in the workspace sees this name."
                defaultValue={initialName}
                required
            />

            <RadioCardGroup
                name="visibility"
                legend="Who can see it"
                options={VISIBILITY_OPTIONS}
                defaultValue={initialVisibility}
            />

            {state?.error ? (
                <p
                    role="alert"
                    className="m-0 text-sm font-semibold text-paddock-danger"
                >
                    {state.error}
                </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-4">
                <PaddockButton type="submit" disabled={isPending}>
                    {isPending ? "Saving..." : "Save changes"}
                </PaddockButton>
                {state?.success && !isPending ? (
                    <p
                        role="status"
                        className="m-0 flex items-center gap-2 font-semibold"
                    >
                        <span
                            aria-hidden="true"
                            className="paddock-night flex size-5.5 shrink-0 items-center justify-center rounded-full text-paddock-lime"
                        >
                            <Check className="size-3" strokeWidth={3} />
                        </span>
                        Workspace settings saved successfully.
                    </p>
                ) : null}
            </div>
        </form>
    );
}
