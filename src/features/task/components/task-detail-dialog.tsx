"use client";

import { startTransition, useActionState, useState } from "react";

import type { TaskPriority, TaskStatus } from "@prisma/client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { deleteTaskAction } from "../actions/delete-task";
import { updateTaskAction } from "../actions/update-task";
import type { TaskWithAssignee } from "../types";
import { TASK_PRIORITY_LABELS, TASK_STATUS_LABELS } from "../types";
import { AssigneePicker, type MemberOption } from "./assignee-picker";
import { PriorityBadge } from "./priority-badge";

export interface TaskDetailDialogProps {
    task: TaskWithAssignee | null;
    members: MemberOption[];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    canEdit?: boolean;
    onTaskUpdated?: (task: TaskWithAssignee) => void;
    onTaskDeleted?: (taskId: string) => void;
}

interface TaskDetailFormProps {
    task: TaskWithAssignee;
    members: MemberOption[];
    canEdit: boolean;
    onClose: () => void;
    onTaskUpdated?: (task: TaskWithAssignee) => void;
    onTaskDeleted?: (taskId: string) => void;
}

function TaskDetailForm({
    task,
    members,
    canEdit,
    onClose,
    onTaskUpdated,
    onTaskDeleted,
}: TaskDetailFormProps) {
    const [title, setTitle] = useState(task.title);
    const [description, setDescription] = useState(task.description ?? "");
    const [status, setStatus] = useState<TaskStatus>(task.status);
    const [priority, setPriority] = useState<TaskPriority>(task.priority);
    const [assigneeId, setAssigneeId] = useState<string | null>(
        task.assigneeId,
    );
    const [dueDate, setDueDate] = useState<string>(
        task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    );
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [updateState, formAction, isSaving] = useActionState(
        async (prev: { error: string | null }, formData: FormData) => {
            formData.set("taskId", task.id);
            formData.set("title", title);
            formData.set("description", description);
            formData.set("status", status);
            formData.set("priority", priority);
            formData.set("assigneeId", assigneeId ?? "");
            formData.set("dueDate", dueDate);

            const result = await updateTaskAction(formData);
            if (!result.success) {
                return { error: result.error };
            }

            onTaskUpdated?.(result.data);
            startTransition(() => {
                onClose();
            });
            return { error: null };
        },
        { error: null },
    );

    async function handleDelete() {
        if (isDeleting) return;
        setIsDeleting(true);

        const result = await deleteTaskAction({ taskId: task.id });
        setIsDeleting(false);

        if (result.success) {
            onTaskDeleted?.(task.id);
            startTransition(() => {
                onClose();
            });
        }
    }

    return (
        <form action={formAction} className="flex flex-col gap-4">
            {updateState.error && (
                <Alert intent="danger" title="Error">
                    {updateState.error}
                </Alert>
            )}

            {/* Title */}
            <FormField label="Task Title" htmlFor="detail-title" required>
                {canEdit ? (
                    <Input
                        id="detail-title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={200}
                    />
                ) : (
                    <p className="font-brand-sans font-semibold text-base text-brand-ink">
                        {task.title}
                    </p>
                )}
            </FormField>

            {/* Description */}
            <FormField label="Description" htmlFor="detail-description">
                {canEdit ? (
                    <textarea
                        id="detail-description"
                        name="description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add description..."
                        maxLength={2000}
                        className="w-full bg-brand-muted text-brand-ink placeholder:text-brand-subtle px-4 py-3 text-sm border-2 border-transparent focus:border-brand-accent transition-colors outline-none rounded-brand font-brand-sans resize-none"
                    />
                ) : (
                    <p className="font-brand-sans text-sm text-brand-subtle whitespace-pre-wrap">
                        {task.description || "No description provided."}
                    </p>
                )}
            </FormField>

            {/* Column & Priority */}
            <div className="grid grid-cols-2 gap-3">
                <FormField label="Column" htmlFor="detail-status">
                    {canEdit ? (
                        <select
                            id="detail-status"
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
                    ) : (
                        <span className="font-brand-mono text-sm font-semibold text-brand-ink">
                            {TASK_STATUS_LABELS[task.status]}
                        </span>
                    )}
                </FormField>

                <FormField label="Priority" htmlFor="detail-priority">
                    {canEdit ? (
                        <select
                            id="detail-priority"
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
                    ) : (
                        <div>
                            <PriorityBadge
                                taskId={task.id}
                                priority={task.priority}
                                canEdit={false}
                            />
                        </div>
                    )}
                </FormField>
            </div>

            {/* Assignee & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <FormField label="Assignee" htmlFor="detail-assignee">
                    {canEdit ? (
                        <AssigneePicker
                            members={members}
                            selectedMemberId={assigneeId}
                            onChange={setAssigneeId}
                        />
                    ) : (
                        <div className="font-brand-sans text-sm text-brand-ink">
                            {task.assignee?.user?.name ||
                                task.assignee?.user?.email ||
                                "Unassigned"}
                        </div>
                    )}
                </FormField>

                <FormField label="Due Date" htmlFor="detail-due-date">
                    {canEdit ? (
                        <input
                            type="date"
                            id="detail-due-date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full bg-brand-surface text-brand-ink text-sm border-2 border-brand-ink rounded-brand px-3 py-2 font-brand-sans focus:outline-none focus:ring-2 focus:ring-brand-accent cursor-pointer"
                        />
                    ) : (
                        <span className="font-brand-mono text-sm text-brand-ink">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "None"}
                        </span>
                    )}
                </FormField>
            </div>

            {/* Metadata */}
            <div className="text-[11px] font-brand-mono text-brand-subtle/70 pt-2 border-t border-brand-border">
                Created {new Date(task.createdAt).toLocaleString()}
            </div>

            {/* Delete Confirmation Alert */}
            {showDeleteConfirm && canEdit && (
                <div className="p-3 bg-brand-danger/10 border-2 border-brand-danger rounded-brand flex flex-col gap-2">
                    <p className="text-xs font-brand-mono text-brand-danger font-semibold uppercase">
                        Permanently delete this task?
                    </p>
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            pendingText="Deleting..."
                        >
                            Confirm Delete
                        </Button>
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-brand-border">
                {canEdit && !showDeleteConfirm ? (
                    <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={isSaving || isDeleting}
                    >
                        Delete
                    </Button>
                ) : (
                    <div />
                )}

                <div className="flex items-center gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={onClose}
                        disabled={isSaving || isDeleting}
                    >
                        Close
                    </Button>
                    {canEdit && (
                        <Button
                            type="submit"
                            variant="primary"
                            size="sm"
                            disabled={isSaving || isDeleting}
                            pendingText="Saving..."
                        >
                            Save Changes
                        </Button>
                    )}
                </div>
            </div>
        </form>
    );
}

export function TaskDetailDialog({
    task,
    members,
    open,
    onOpenChange,
    canEdit = false,
    onTaskUpdated,
    onTaskDeleted,
}: TaskDetailDialogProps) {
    if (!task) return null;

    return (
        <Dialog
            open={open}
            onClose={() => onOpenChange(false)}
            title={canEdit ? "Edit Task" : "Task Details"}
            className="max-w-xl"
        >
            <TaskDetailForm
                key={task.id}
                task={task}
                members={members}
                canEdit={canEdit}
                onClose={() => onOpenChange(false)}
                onTaskUpdated={onTaskUpdated}
                onTaskDeleted={onTaskDeleted}
            />
        </Dialog>
    );
}
