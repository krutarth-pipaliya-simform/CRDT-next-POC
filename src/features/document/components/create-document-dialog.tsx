"use client";

import { useId, useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import { PaddockInput } from "@/components/paddock/paddock-field";

import { createDocumentAction } from "../actions/create-document";

export interface CreateDocumentDialogProps {
    workspaceId: string;
    open: boolean;
    onClose: () => void;
}

export function CreateDocumentDialog({
    workspaceId,
    open,
    onClose,
}: CreateDocumentDialogProps) {
    const [title, setTitle] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    // The actions sit in the dialog footer, outside the <form>, so the submit
    // button points back at it with the `form` attribute.
    const formId = useId();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        startTransition(async () => {
            const result = await createDocumentAction({
                workspaceId,
                title: title.trim() || "Untitled Document",
            });

            if (result.success) {
                setTitle("");
                onClose();
                router.push(`/${workspaceId}/documents/${result.data.id}`);
            } else {
                setError(result.error);
            }
        });
    };

    return (
        <PaddockDialog
            open={open}
            onClose={onClose}
            titleSerif="New"
            titleHeavy="document"
            className="w-[30rem]"
            footer={
                <>
                    <PaddockButton
                        variant="outline"
                        voice="plain"
                        onClick={onClose}
                    >
                        Cancel
                    </PaddockButton>
                    <PaddockButton
                        type="submit"
                        form={formId}
                        disabled={isPending}
                    >
                        {isPending ? "Creating…" : "Create document"}
                    </PaddockButton>
                </>
            }
        >
            <form id={formId} onSubmit={handleSubmit}>
                <PaddockInput
                    id="create-doc-title"
                    label="Document title"
                    hint="Leave it empty to start an untitled document."
                    error={error ?? undefined}
                    placeholder="Launch plan"
                    value={title}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        setError(null);
                    }}
                    data-autofocus
                />
            </form>
        </PaddockDialog>
    );
}
