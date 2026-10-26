"use client";

import {
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type KeyboardEvent,
} from "react";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/cn";
import { MESSAGE_MAX_LENGTH } from "@/schemas/chat";

export interface MessageComposerProps {
    onSend: (body: string) => void;
    onTyping: () => void;
    disabled?: boolean;
    placeholder?: string;
}

/** Height ceiling before the textarea starts scrolling instead of growing. */
const MAX_TEXTAREA_HEIGHT_PX = 180;

/**
 * The message box pinned under the log, styled as Paddock's `ChatComposer`.
 * It stays its own component because the stock one cannot broadcast typing,
 * carry the test hooks, or be disabled. Enter sends, Shift+Enter starts a new
 * line, and the whole box takes the focus ring while the textarea has focus.
 */
export function MessageComposer({
    onSend,
    onTyping,
    disabled = false,
    placeholder = "Message everyone — use @ to mention a teammate",
}: MessageComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");
    const hintId = useId();

    const trimmed = value.trim();
    const isOverLimit = value.length > MESSAGE_MAX_LENGTH;
    const canSubmit = trimmed.length > 0 && !isOverLimit && !disabled;

    const resize = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(
            textarea.scrollHeight,
            MAX_TEXTAREA_HEIGHT_PX,
        )}px`;
    };

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.currentTarget.value);
        resize();
        onTyping();
    };

    const submit = () => {
        if (!canSubmit) return;

        onSend(trimmed);
        setValue("");

        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            textarea.focus();
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        // Enter sends; Shift+Enter inserts a newline
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            submit();
        }
    };

    return (
        <div
            className={cn(
                "paddock-compose-box rounded-xl border-[1.5px] bg-paddock-paper",
                isOverLimit ? "border-paddock-danger" : "border-paddock-ink",
            )}
        >
            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                rows={1}
                aria-label="Message"
                aria-describedby={hintId}
                aria-invalid={isOverLimit ? true : undefined}
                data-testid="chat-composer-input"
                placeholder={placeholder}
                className="block max-h-[180px] min-h-12 w-full resize-none overflow-y-auto border-0 bg-transparent px-4 pt-3.5 pb-1.5 text-[0.9375rem] leading-normal font-medium text-paddock-ink placeholder:text-paddock-subtle disabled:cursor-not-allowed disabled:opacity-55"
            />

            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 px-2 pt-1 pb-2">
                {value.length > MESSAGE_MAX_LENGTH * 0.8 && (
                    <span
                        aria-live="polite"
                        className={cn(
                            "paddock-mono text-xs",
                            isOverLimit
                                ? "font-semibold text-paddock-danger"
                                : "text-paddock-subtle",
                        )}
                    >
                        {value.length} / {MESSAGE_MAX_LENGTH}
                    </span>
                )}
                <span
                    id={hintId}
                    className="hidden text-xs text-paddock-subtle sm:inline"
                >
                    Enter to send · Shift + Enter for a new line
                </span>
                <button
                    type="button"
                    onClick={submit}
                    aria-disabled={canSubmit ? undefined : true}
                    data-testid="chat-send-button"
                    className="paddock-press paddock-heavy inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 rounded-paddock bg-paddock-lime px-4 text-sm text-paddock-on-fill aria-disabled:cursor-not-allowed aria-disabled:opacity-45"
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
    );
}
