"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
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
        <Dialog open={open} onClose={onClose} title="Create New Document">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                    label="Document Title"
                    htmlFor="create-doc-title"
                    error={error ?? undefined}
                >
                    <Input
                        id="create-doc-title"
                        type="text"
                        placeholder="e.g. Sprint Architecture Spec"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            setError(null);
                        }}
                        autoFocus
                    />
                </FormField>

                <div className="flex justify-end gap-3 mt-2">
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                    >
                        <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />
                        {isPending ? "Creating..." : "Create Document"}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
