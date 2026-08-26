import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
    label: string;
    htmlFor: string;
    error?: string;
    required?: boolean;
}

export function FormField({
    label,
    htmlFor,
    error,
    required,
    className,
    children,
    ...props
}: FormFieldProps) {
    return (
        <div className={cn("flex flex-col gap-2 w-full", className)} {...props}>
            <label
                htmlFor={htmlFor}
                className="font-brand-mono text-xs uppercase tracking-wider text-brand-ink"
            >
                {label}
                {required && (
                    <span aria-hidden="true" className="text-brand-danger ml-1">
                        *
                    </span>
                )}
            </label>
            {children}
            {error && (
                <span
                    id={`${htmlFor}-error`}
                    role="alert"
                    className="text-brand-danger text-xs font-brand-mono uppercase tracking-wider"
                >
                    {error}
                </span>
            )}
        </div>
    );
}
