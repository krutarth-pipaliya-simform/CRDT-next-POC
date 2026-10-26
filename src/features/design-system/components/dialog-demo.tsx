"use client";

import { useState } from "react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import {
    PaddockInput,
    PaddockSelect,
    PaddockTextarea,
} from "@/components/paddock/paddock-field";

const COLUMN_OPTIONS = [
    { value: "TODO", label: "To do" },
    { value: "IN_PROGRESS", label: "In progress" },
    { value: "DONE", label: "Done" },
];

const PRIORITY_OPTIONS = [
    { value: "LOW", label: "Low" },
    { value: "MEDIUM", label: "Medium" },
    { value: "HIGH", label: "High" },
    { value: "URGENT", label: "Urgent" },
];

/** The task dialog from the board, with enough fields to make the body scroll. */
export function DialogDemo() {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <>
            <PaddockButton onClick={() => setOpen(true)}>
                New task
            </PaddockButton>
            <PaddockDialog
                open={open}
                onClose={close}
                titleSerif="New"
                titleHeavy="task"
                description="Nothing is saved in this showcase."
                footer={
                    <>
                        <PaddockButton
                            variant="outline"
                            voice="plain"
                            onClick={close}
                        >
                            Cancel
                        </PaddockButton>
                        <PaddockButton onClick={close}>
                            Create task
                        </PaddockButton>
                    </>
                }
            >
                <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                    <PaddockInput
                        id="demo-task-title"
                        label="Task title"
                        placeholder="e.g. Implement real-time notifications"
                        maxLength={200}
                        autoFocus
                        wrapperClassName="sm:col-span-2"
                    />
                    <PaddockTextarea
                        id="demo-task-description"
                        label="Description"
                        rows={4}
                        maxLength={2000}
                        placeholder="What does done look like?"
                        wrapperClassName="sm:col-span-2"
                    />
                    <PaddockSelect
                        id="demo-task-column"
                        label="Column"
                        options={COLUMN_OPTIONS}
                        defaultValue="TODO"
                    />
                    <PaddockSelect
                        id="demo-task-priority"
                        label="Priority"
                        options={PRIORITY_OPTIONS}
                        defaultValue="MEDIUM"
                    />
                    <PaddockInput
                        id="demo-task-due"
                        label="Due date"
                        type="date"
                    />
                    <PaddockInput
                        id="demo-task-estimate"
                        label="Estimate"
                        placeholder="e.g. 2 days"
                        hint="Optional. Shown on the card."
                    />
                </div>
            </PaddockDialog>
        </>
    );
}
