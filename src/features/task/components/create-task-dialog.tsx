"use client";

import { startTransition, useActionState, useState } from "react";

import type { TaskPriority, TaskStatus } from "@prisma/client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { createTaskAction } from "../actions/create-task";
import type { TaskWithAssignee } from "../types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "../types";
import { AssigneePicker, type MemberOption } from "./assignee-picker";

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
        <Dialog
            open={open}
            onClose={handleClose}
            title="Create Task"
            className="max-w-lg"
        >
            <form action={formAction} className="flex flex-col gap-4">
                {state.error && (
                    <Alert intent="danger" title="Validation Error">
                        {state.error}
                    </Alert>
                )}

                <div key={state.key} className="flex flex-col gap-4">
                    {/* Title */}
                    <FormField label="Task Title" htmlFor="task-title" required>
                        <Input
                            id="task-title"
                            name="title"
                            placeholder="e.g. Implement real-time notifications"
                            required
                            autoFocus
                            maxLength={200}
                        />
                    </FormField>

                    {/* Description */}
                    <FormField label="Description" htmlFor="task-description">
                        <textarea
                            id="task-description"
                            name="description"
                            rows={3}
                            placeholder="Add context, details, or checklist..."
                            maxLength={2000}
                            className="w-full bg-brand-muted text-brand-ink placeholder:text-brand-subtle px-4 py-3 text-sm border-2 border-transparent focus:border-brand-accent transition-colors outline-none rounded-brand font-brand-sans resize-none"
                        />
                    </FormField>

                    {/* Status & Priority row */}
                    <div className="grid grid-cols-2 gap-3">
                        <FormField label="Column" htmlFor="task-status">
                            <select
                                id="task-status"
                                value={status}
                                onChange={(e) =>
                                    setStatus(e.target.value as TaskStatus)
                                }
                                className="w-full bg-brand-surface text-brand-ink text-sm border-2 border-brand-ink rounded-brand px-3 py-2 font-brand-sans focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                            >
                                <option value="TODO">
                                    {TASK_STATUS_LABELS.TODO}
                                </option>
                                <option value="IN_PROGRESS">
                                    {TASK_STATUS_LABELS.IN_PROGRESS}
                                </option>
                                <option value="DONE">
                                    {TASK_STATUS_LABELS.DONE}
                                </option>
                            </select>
                        </FormField>

                        <FormField label="Priority" htmlFor="task-priority">
                            <select
                                id="task-priority"
                                value={priority}
                                onChange={(e) =>
                                    setPriority(e.target.value as TaskPriority)
                                }
                                className="w-full bg-brand-surface text-brand-ink text-sm border-2 border-brand-ink rounded-brand px-3 py-2 font-brand-sans focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                            >
                                <option value="LOW">
                                    {TASK_PRIORITY_LABELS.LOW}
                                </option>
                                <option value="MEDIUM">
                                    {TASK_PRIORITY_LABELS.MEDIUM}
                                </option>
                                <option value="HIGH">
                                    {TASK_PRIORITY_LABELS.HIGH}
                                </option>
                                <option value="URGENT">
                                    {TASK_PRIORITY_LABELS.URGENT}
                                </option>
                            </select>
                        </FormField>
                    </div>

                    {/* Assignee & Due Date row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <FormField label="Assignee" htmlFor="task-assignee">
                            <AssigneePicker
                                members={members}
                                selectedMemberId={selectedAssignee}
                                onChange={setSelectedAssignee}
                            />
                        </FormField>

                        <FormField label="Due Date" htmlFor="task-due-date">
                            <input
                                type="date"
                                id="task-due-date"
                                name="dueDate"
                                className="w-full bg-brand-surface text-brand-ink text-sm border-2 border-brand-ink rounded-brand px-3 py-2 font-brand-sans focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                            />
                        </FormField>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-3 border-t border-brand-border">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        disabled={isPending}
                        pendingText="Creating..."
                    >
                        Create Task
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
