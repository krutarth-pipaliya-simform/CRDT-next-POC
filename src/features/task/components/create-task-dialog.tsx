"use client";

import { startTransition, useActionState, useState } from "react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import {
    PaddockInput,
    PaddockSelect,
    PaddockTextarea,
} from "@/components/paddock/paddock-field";
import { taskPrioritySchema, taskStatusSchema } from "@/schemas/task";

import { createTaskAction } from "../actions/create-task";
import type { TaskWithAssignee } from "../types";
import { AssigneePicker, type MemberOption } from "./assignee-picker";
import {
    TASK_PRIORITY_OPTIONS,
    TASK_STATUS_OPTIONS,
    TaskField,
    TaskFormError,
} from "./task-form-parts";

export interface CreateTaskDialogProps {
    workspaceId: string;
    members: MemberOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultStatus?: TaskStatus;
    onTaskCreated?: (task: TaskWithAssignee) => void;
}

export function CreateTaskDialog({
    workspaceId,
    members,
    open,
    onOpenChange,
    defaultStatus = "TODO",
    onTaskCreated,
}: CreateTaskDialogProps) {
    const [selectedAssignee, setSelectedAssignee] = useState<string | null>(
        null,
    );
    const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
    const [status, setStatus] = useState<TaskStatus>(defaultStatus);

    const [state, formAction, isPending] = useActionState(
        async (
            prev: { error: string | null; key: number },
            formData: FormData,
        ) => {
            formData.set("workspaceId", workspaceId);
            formData.set("status", status);
            formData.set("priority", priority);
            if (selectedAssignee) {
                formData.set("assigneeId", selectedAssignee);
            }

            const result = await createTaskAction(formData);
            if (!result.success) {
                return { error: result.error, key: prev.key };
            }

            onTaskCreated?.(result.data);
            setSelectedAssignee(null);
            setPriority("MEDIUM");
            setStatus(defaultStatus);

            startTransition(() => {
                onOpenChange(false);
            });

            return { error: null, key: prev.key + 1 };
        },
        { error: null, key: 0 },
    );

    function handleClose() {
        if (isPending) return;
        onOpenChange(false);
    }

    return (
        <PaddockDialog
            open={open}
            onClose={handleClose}
            titleSerif="New"
            titleHeavy="task"
        >
            <form action={formAction} className="flex flex-col">
                {state.error && <TaskFormError message={state.error} />}

                <div
                    key={state.key}
                    className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2"
                >
                    <PaddockInput
                        id="task-title"
                        name="title"
                        label="Task title"
                        placeholder="e.g. Implement real-time notifications"
                        required
                        data-autofocus
                        maxLength={200}
                        wrapperClassName="sm:col-span-2"
                    />

                    <PaddockTextarea
                        id="task-description"
                        name="description"
                        label="Description"
                        rows={3}
                        placeholder="Add context, details, or checklist..."
                        maxLength={2000}
                        wrapperClassName="sm:col-span-2"
                    />

                    <PaddockSelect
                        id="task-status"
                        label="Column"
                        options={TASK_STATUS_OPTIONS}
                        value={status}
                        onChange={(e) => {
                            const parsed = taskStatusSchema.safeParse(
                                e.target.value,
                            );
                            if (parsed.success) setStatus(parsed.data);
                        }}
                    />

                    <PaddockSelect
                        id="task-priority"
                        label="Priority"
                        options={TASK_PRIORITY_OPTIONS}
                        value={priority}
                        onChange={(e) => {
                            const parsed = taskPrioritySchema.safeParse(
                                e.target.value,
                            );
                            if (parsed.success) setPriority(parsed.data);
                        }}
                    />

                    <TaskField htmlFor="task-assignee" label="Assignee">
                        <AssigneePicker
                            id="task-assignee"
                            members={members}
                            selectedMemberId={selectedAssignee}
                            onChange={setSelectedAssignee}
                        />
                    </TaskField>

                    <PaddockInput
                        id="task-due-date"
                        name="dueDate"
                        type="date"
                        label="Due date"
                        className="cursor-pointer"
                    />
                </div>

                {/* Actions */}
                <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5 border-t border-paddock-rule pt-4.5">
                    <PaddockButton
                        variant="outline"
                        voice="plain"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        Cancel
                    </PaddockButton>
                    <PaddockButton
                        type="submit"
                        variant="primary"
                        disabled={isPending}
                    >
                        {isPending ? "Creating…" : "Create task"}
                    </PaddockButton>
                </div>
            </form>
        </PaddockDialog>
    );
}
