import type {
    InputHTMLAttributes,
    ReactNode,
    SelectHTMLAttributes,
    TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/cn";

import { paddockFieldClasses } from "./paddock-styles";
import { Tag } from "./tag";

interface FieldFrameProps {
    id: string;
    label: string;
    hint?: string;
    error?: string;
    className?: string;
    children: ReactNode;
}

/** Ids for the hint and error, so the control can point at both. */
function describedBy(id: string, hint?: string, error?: string) {
    const ids = [hint ? `${id}-hint` : null, error ? `${id}-error` : null]
        .filter(Boolean)
        .join(" ");
    return ids || undefined;
}

/**
 * Visible label (as a Tag), the control, then hint or error. The error is a
 * sentence, never colour alone, and is announced when it appears.
 */
function FieldFrame({
    id,
    label,
    hint,
    error,
    className,
    children,
}: FieldFrameProps) {
    return (
        <div className={cn("flex flex-col gap-1.5", className)}>
            <label htmlFor={id} className="w-fit">
                <Tag tone="ink">{label}</Tag>
            </label>
            {children}
            {hint && !error ? (
                <p
                    id={`${id}-hint`}
                    className="m-0 text-[0.8125rem] text-paddock-subtle"
                >
                    {hint}
                </p>
            ) : null}
            {error ? (
                <p
                    id={`${id}-error`}
                    role="alert"
                    className="m-0 text-[0.8125rem] font-semibold text-paddock-danger"
                >
                    {error}
                </p>
            ) : null}
        </div>
    );
}

interface PaddockFieldOwnProps {
    /** Required so the label, hint and error can be wired without a hook. */
    id: string;
    label: string;
    hint?: string;
    error?: string;
    wrapperClassName?: string;
}

export interface PaddockInputProps
    extends
        Omit<InputHTMLAttributes<HTMLInputElement>, "id">,
        PaddockFieldOwnProps {}

export function PaddockInput({
    id,
    label,
    hint,
    error,
    wrapperClassName,
    className,
    type = "text",
    ...props
}: PaddockInputProps) {
    return (
        <FieldFrame
            id={id}
            label={label}
            hint={hint}
            error={error}
            className={wrapperClassName}
        >
            <input
                id={id}
                type={type}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cn(paddockFieldClasses, "h-13", className)}
                {...props}
            />
        </FieldFrame>
    );
}

export interface PaddockTextareaProps
    extends
        Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "id">,
        PaddockFieldOwnProps {}

export function PaddockTextarea({
    id,
    label,
    hint,
    error,
    wrapperClassName,
    className,
    rows = 3,
    ...props
}: PaddockTextareaProps) {
    return (
        <FieldFrame
            id={id}
            label={label}
            hint={hint}
            error={error}
            className={wrapperClassName}
        >
            <textarea
                id={id}
                rows={rows}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cn(
                    paddockFieldClasses,
                    "resize-y py-3 leading-normal",
                    className,
                )}
                {...props}
            />
        </FieldFrame>
    );
}

export interface PaddockSelectOption {
    value: string;
    label: string;
}

export interface PaddockSelectProps
    extends
        Omit<SelectHTMLAttributes<HTMLSelectElement>, "id" | "children">,
        PaddockFieldOwnProps {
    options: PaddockSelectOption[];
}

/** A native select: the platform picker is the accessible one on every device. */
export function PaddockSelect({
    id,
    label,
    hint,
    error,
    wrapperClassName,
    className,
    options,
    ...props
}: PaddockSelectProps) {
    return (
        <FieldFrame
            id={id}
            label={label}
            hint={hint}
            error={error}
            className={wrapperClassName}
        >
            <select
                id={id}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy(id, hint, error)}
                className={cn(
                    paddockFieldClasses,
                    "h-13 cursor-pointer",
                    className,
                )}
                {...props}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        </FieldFrame>
    );
}
