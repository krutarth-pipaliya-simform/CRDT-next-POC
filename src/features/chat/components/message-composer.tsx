"use client";

import { useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { MESSAGE_MAX_LENGTH } from "@/schemas/chat";

export interface MessageComposerProps {
    onSend: (body: string) => void;
    onTyping: () => void;
    disabled?: boolean;
    placeholder?: string;
}

/** Height ceiling before the textarea starts scrolling instead of growing. */
const MAX_TEXTAREA_HEIGHT_PX = 160;

export function MessageComposer({
    onSend,
    onTyping,
    disabled = false,
    placeholder = "Write a message — use @ to mention a teammate",
}: MessageComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = useState("");

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
        <div className="border-t-2 border-brand-muted p-3">
            <div className="flex items-end gap-3">
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    disabled={disabled}
                    rows={1}
                    aria-label="Message"
                    data-testid="chat-composer-input"
                    placeholder={placeholder}
                    className={cn(
                        "flex-1 resize-none bg-brand-surface text-brand-ink placeholder:text-brand-subtle/70",
                        "px-3 py-2.5 text-sm border rounded-brand transition-colors",
                        "disabled:opacity-60 disabled:cursor-not-allowed",
                        isOverLimit
                            ? "border-brand-danger"
                            : "border-brand-line hover:border-brand-ink",
                    )}
                />

                <Button
                    type="button"
                    size="sm"
                    onClick={submit}
                    disabled={!canSubmit}
                    data-testid="chat-send-button"
                    className="shrink-0"
                >
                    Send
                </Button>
            </div>

            <div className="flex items-center justify-between gap-3 mt-1.5 px-1">
                <span className="text-[13px] text-brand-subtle">
                    Enter sends. Shift + Enter starts a new line.
                </span>
                {value.length > MESSAGE_MAX_LENGTH * 0.8 && (
                    <span
                        className={cn(
                            "font-brand-mono text-[11px] shrink-0 tabular-nums",
                            isOverLimit
                                ? "text-brand-danger"
                                : "text-brand-subtle",
                        )}
                    >
                        {value.length}/{MESSAGE_MAX_LENGTH}
                    </span>
                )}
            </div>
        </div>
    );
}
