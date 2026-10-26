"use client";

import { startTransition, useActionState, useState } from "react";
import type { TaskPriority, TaskStatus } from "@prisma/client";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import {
    PaddockInput,
    PaddockSelect,
    PaddockTextarea,
} from "@/components/paddock/paddock-field";
import { PriorityLabel, StatusPill } from "@/components/paddock/paddock-pills";
import { taskPrioritySchema, taskStatusSchema } from "@/schemas/task";

import { deleteTaskAction } from "../actions/delete-task";
import { updateTaskAction } from "../actions/update-task";
import type { TaskWithAssignee } from "../types";
import { AssigneePicker, type MemberOption } from "./assignee-picker";
import {
    TASK_PRIORITY_OPTIONS,
    TASK_STATUS_OPTIONS,
    TaskField,
    TaskFormError,
} from "./task-form-parts";

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

    const assignee = task.assignee?.user
        ? {
              id: task.assignee.user.id,
              name:
                  task.assignee.user.name ||
                  task.assignee.user.email ||
                  "Member",
              image: task.assignee.user.image,
          }
        : null;

    return (
        <form action={formAction} className="flex flex-col">
            {updateState.error && <TaskFormError message={updateState.error} />}

            <div className="grid grid-cols-1 gap-x-4 gap-y-3.5 sm:grid-cols-2">
                {/* Title */}
                {canEdit ? (
                    <PaddockInput
                        id="detail-title"
                        name="title"
                        label="Task title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        maxLength={200}
                        wrapperClassName="sm:col-span-2"
                    />
                ) : (
                    <TaskField label="Task title" className="sm:col-span-2">
                        <p className="m-0 text-base font-bold">{task.title}</p>
                    </TaskField>
                )}

                {/* Description */}
                {canEdit ? (
                    <PaddockTextarea
                        id="detail-description"
                        name="description"
                        label="Description"
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Add description..."
                        maxLength={2000}
                        wrapperClassName="sm:col-span-2"
                    />
                ) : (
                    <TaskField label="Description" className="sm:col-span-2">
                        <p className="m-0 text-sm whitespace-pre-wrap text-paddock-subtle">
                            {task.description || "No description provided."}
                        </p>
                    </TaskField>
                )}

                {/* Column & Priority */}
                {canEdit ? (
                    <PaddockSelect
                        id="detail-status"
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
                ) : (
                    <TaskField label="Column">
                        <span>
                            <StatusPill status={task.status} />
                        </span>
                    </TaskField>
                )}

                {canEdit ? (
                    <PaddockSelect
                        id="detail-priority"
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
                ) : (
                    <TaskField label="Priority">
                        <PriorityLabel
                            priority={task.priority}
                            className="text-sm"
                        />
                    </TaskField>
                )}

                {/* Assignee & Due Date */}
                {canEdit ? (
                    <TaskField htmlFor="detail-assignee" label="Assignee">
                        <AssigneePicker
                            id="detail-assignee"
                            members={members}
                            selectedMemberId={assigneeId}
                            onChange={setAssigneeId}
                        />
                    </TaskField>
                ) : (
                    <TaskField label="Assignee">
                        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                            {assignee ? (
                                <PaddockAvatar
                                    person={assignee}
                                    size="sm"
                                    decorative
                                />
                            ) : null}
                            <span className="truncate">
                                {assignee?.name ?? "Unassigned"}
                            </span>
                        </span>
                    </TaskField>
                )}

                {canEdit ? (
                    <PaddockInput
                        id="detail-due-date"
                        type="date"
                        label="Due date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="cursor-pointer"
                    />
                ) : (
                    <TaskField label="Due date">
                        <span className="paddock-mono text-sm">
                            {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "None"}
                        </span>
                    </TaskField>
                )}
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm && canEdit && (
                <div
                    role="alert"
                    className="mt-4.5 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border-[1.5px] border-paddock-danger px-4 py-3.5"
                >
                    <p className="m-0 font-bold text-paddock-danger">
                        Permanently delete this task?
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <PaddockButton
                            variant="outline"
                            voice="plain"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                        >
                            Cancel
                        </PaddockButton>
                        <PaddockButton
                            variant="danger"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting…" : "Delete task"}
                        </PaddockButton>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-paddock-rule pt-4.5">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {canEdit && !showDeleteConfirm ? (
                        <PaddockButton
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={isSaving || isDeleting}
                            className="-ml-2 px-2 font-bold text-paddock-danger hover:bg-paddock-danger/8"
                        >
                            Delete
                        </PaddockButton>
                    ) : null}
                    <span className="paddock-mono text-xs text-paddock-subtle">
                        Created {new Date(task.createdAt).toLocaleString()}
                    </span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                    <PaddockButton
                        variant="outline"
                        voice="plain"
                        onClick={onClose}
                        disabled={isSaving || isDeleting}
                    >
                        Close
                    </PaddockButton>
                    {canEdit && (
                        <PaddockButton
                            type="submit"
                            variant="primary"
                            disabled={isSaving || isDeleting}
                        >
                            {isSaving ? "Saving…" : "Save changes"}
                        </PaddockButton>
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
    // The dialog stays mounted so closing it can hand focus back to the card;
    // only the form comes and goes with the selected task.
    return (
        <PaddockDialog
            open={open && task !== null}
            onClose={() => onOpenChange(false)}
            titleSerif={canEdit ? "Edit" : "Task"}
            titleHeavy={canEdit ? "task" : "details"}
        >
            {task ? (
                <TaskDetailForm
                    key={task.id}
                    task={task}
                    members={members}
                    canEdit={canEdit}
                    onClose={() => onOpenChange(false)}
                    onTaskUpdated={onTaskUpdated}
                    onTaskDeleted={onTaskDeleted}
                />
            ) : null}
        </PaddockDialog>
    );
}
