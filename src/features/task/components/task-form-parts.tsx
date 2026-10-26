import type { ReactNode } from "react";

import type { PaddockSelectOption } from "@/components/paddock/paddock-field";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";
import { taskPrioritySchema } from "@/schemas/task";

import {
    COLUMN_ORDER,
    TASK_PRIORITY_LABELS,
    TASK_STATUS_LABELS,
} from "../types";

/** Pieces shared by the create and detail dialogs, so both read as one form. */

export const TASK_STATUS_OPTIONS: PaddockSelectOption[] = COLUMN_ORDER.map(
    (status) => ({ value: status, label: TASK_STATUS_LABELS[status] }),
);

export const TASK_PRIORITY_OPTIONS: PaddockSelectOption[] =
    taskPrioritySchema.options.map((priority) => ({
        value: priority,
        label: TASK_PRIORITY_LABELS[priority],
    }));

export interface TaskFieldProps {
    /** The control's id. Omit for a read-only value, which has no control. */
    htmlFor?: string;
    label: string;
    children: ReactNode;
    className?: string;
}

/**
 * A field whose control is not a Paddock input (the assignee picker, a
 * read-only value), labelled the same way `PaddockInput` labels its own.
 */
export function TaskField({
    htmlFor,
    label,
    children,
    className,
}: TaskFieldProps) {
    return (
        <div className={cn("flex min-w-0 flex-col gap-1.5", className)}>
            {htmlFor ? (
                <label htmlFor={htmlFor} className="w-fit">
                    <Tag tone="ink">{label}</Tag>
                </label>
            ) : (
                <Tag as="p" tone="ink">
                    {label}
                </Tag>
            )}
            {children}
        </div>
    );
}

export interface TaskFormErrorProps {
    message: string;
}

/** A failed save, said in a sentence and announced as it appears. */
export function TaskFormError({ message }: TaskFormErrorProps) {
    return (
        <p
            role="alert"
            className="m-0 mb-4 rounded-[10px] border-[1.5px] border-paddock-danger px-4 py-3 text-sm font-semibold text-paddock-danger"
        >
            {message}
        </p>
    );
}
