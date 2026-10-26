"use client";

import {
    useId,
    useRef,
    useState,
    type FormEvent,
    type KeyboardEvent,
    type ReactNode,
} from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/cn";

/** The box grows with the text up to this height, then scrolls. */
const MAX_HEIGHT_PX = 180;

export interface ChatComposerProps {
    /** Visible to screen readers only; the placeholder is not a label. */
    label: string;
    placeholder?: string;
    maxLength?: number;
    onSend: (text: string) => void;
    /** Formatting buttons, set inside the box at the lower left. */
    tools?: ReactNode;
    className?: string;
}

/** Grow the textarea to fit its content, measured in the event, not an effect. */
function fitToContent(textarea: HTMLTextAreaElement) {
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT_PX)}px`;
}

/**
 * The message box pinned to the bottom of a full-height chat. Enter sends,
 * Shift+Enter starts a new line, and Send lives inside the box. The send
 * button stays focusable while empty (`aria-disabled`), so keyboard users can
 * find it and hear why it does nothing. A character counter appears near the
 * limit, and is announced politely.
 */
export function ChatComposer({
    label,
    placeholder,
    maxLength = 2000,
    onSend,
    tools,
    className,
}: ChatComposerProps) {
    const [draft, setDraft] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const textareaId = useId();
    const hintId = useId();

    const empty = draft.trim().length === 0;
    const nearLimit = draft.length > maxLength * 0.8;

    function send() {
        if (empty) return;
        onSend(draft.trim());
        setDraft("");
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.focus();
        }
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        send();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
        if (
            event.key === "Enter" &&
            !event.shiftKey &&
            !event.nativeEvent.isComposing
        ) {
            event.preventDefault();
            send();
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={cn(
                "paddock-compose-box rounded-xl border-[1.5px] border-paddock-ink bg-paddock-paper",
                className,
            )}
        >
            <label htmlFor={textareaId} className="sr-only">
                {label}
            </label>
            <textarea
                ref={textareaRef}
                id={textareaId}
                rows={1}
                value={draft}
                maxLength={maxLength}
                placeholder={placeholder}
                aria-describedby={hintId}
                onChange={(event) => {
                    setDraft(event.target.value);
                    fitToContent(event.currentTarget);
                }}
                onKeyDown={handleKeyDown}
                className="block max-h-[180px] min-h-12 w-full resize-none overflow-y-auto border-0 bg-transparent px-4 pt-3.5 pb-1.5 text-[0.9375rem] leading-normal font-medium text-paddock-ink placeholder:text-paddock-subtle"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 px-2 pt-1 pb-2">
                <div className="flex gap-0.5">{tools}</div>
                <div className="flex flex-wrap items-center justify-end gap-3">
                    <span
                        aria-live="polite"
                        className="paddock-mono text-xs text-paddock-subtle"
                    >
                        {nearLimit ? `${draft.length} / ${maxLength}` : ""}
                    </span>
                    <span
                        id={hintId}
                        className="hidden text-xs text-paddock-subtle sm:inline"
                    >
                        Enter to send · Shift + Enter for a new line
                    </span>
                    <button
                        type="submit"
                        aria-disabled={empty ? true : undefined}
                        className="paddock-press paddock-heavy inline-flex h-11 cursor-pointer items-center gap-2 rounded-paddock bg-paddock-lime px-4 text-sm text-paddock-on-fill aria-disabled:cursor-not-allowed aria-disabled:opacity-45"
                    >
                        Send
                        <ArrowRight
                            aria-hidden="true"
                            className="size-3.5"
                            strokeWidth={2.4}
                        />
                    </button>
                </div>
            </div>
        </form>
    );
}

export interface ComposerToolProps {
    label: string;
    children: ReactNode;
    onClick?: () => void;
}

/** A 44px icon tool for inside the composer. */
export function ComposerTool({ label, children, onClick }: ComposerToolProps) {
    return (
        <button
            type="button"
            aria-label={label}
            onClick={onClick}
            className="flex size-11 cursor-pointer items-center justify-center rounded-paddock bg-transparent text-paddock-ink transition-colors hover:bg-paddock-ink/8"
        >
            <span aria-hidden="true" className="inline-flex">
                {children}
            </span>
        </button>
    );
}
