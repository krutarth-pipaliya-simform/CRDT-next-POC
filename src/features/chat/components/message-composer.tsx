"use client";

import {
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type ClipboardEvent,
    type DragEvent,
    type KeyboardEvent,
} from "react";
import { ArrowRight, FileText, Paperclip, X } from "lucide-react";

import { cn } from "@/lib/cn";
import {
    CHAT_ATTACHMENT_ACCEPT,
    chatAttachmentSchema,
    MESSAGE_MAX_LENGTH,
} from "@/schemas/chat";

import { formatFileSize } from "../lib/format-file-size";

export interface MessageComposerProps {
    onSend: (body: string, file: File | null) => void;
    onTyping: () => void;
    disabled?: boolean;
    placeholder?: string;
}

/** Height ceiling before the textarea starts scrolling instead of growing. */
const MAX_TEXTAREA_HEIGHT_PX = 180;

function hasFiles(event: DragEvent<HTMLElement>): boolean {
    return Array.from(event.dataTransfer.types).includes("Files");
}

/**
 * The message box pinned under the log, styled as Paddock's `ChatComposer`.
 * It stays its own component because the stock one cannot broadcast typing,
 * carry the test hooks, attach a file, or be disabled. Enter sends,
 * Shift+Enter starts a new line, and the whole box takes the focus ring while
 * the textarea has focus. One file can ride along with a message: picked with
 * the paperclip, dropped on the box, or pasted. It is checked against the
 * same allow-list and size cap the server enforces before anything uploads.
 */
export function MessageComposer({
    onSend,
    onTyping,
    disabled = false,
    placeholder = "Message everyone — use @ to mention a teammate",
}: MessageComposerProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [value, setValue] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [fileError, setFileError] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const hintId = useId();
    const errorId = useId();

    const trimmed = value.trim();
    const isOverLimit = value.length > MESSAGE_MAX_LENGTH;
    const canSubmit =
        (trimmed.length > 0 || file !== null) && !isOverLimit && !disabled;

    const resize = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(
            textarea.scrollHeight,
            MAX_TEXTAREA_HEIGHT_PX,
        )}px`;
    };

    const attach = (candidate: File) => {
        const checked = chatAttachmentSchema.safeParse(candidate);
        if (!checked.success) {
            setFile(null);
            setFileError(
                checked.error.issues[0]?.message ?? "That file can't be shared",
            );
            return;
        }

        setFile(candidate);
        setFileError(null);
    };

    const clearFile = () => {
        setFile(null);
        setFileError(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setValue(event.currentTarget.value);
        resize();
        onTyping();
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        const picked = event.currentTarget.files?.[0];
        if (picked) attach(picked);
        // Let the same file be picked again after it is removed
        event.currentTarget.value = "";
    };

    const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        const pasted = event.clipboardData.files[0];
        if (!pasted) return;

        event.preventDefault();
        attach(pasted);
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (disabled || !hasFiles(event)) return;
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
        const next = event.relatedTarget;
        if (next instanceof Node && event.currentTarget.contains(next)) return;
        setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        setIsDragging(false);
        const dropped = event.dataTransfer.files[0];
        if (disabled || !dropped) return;

        event.preventDefault();
        attach(dropped);
    };

    const submit = () => {
        if (!canSubmit) return;

        onSend(trimmed, file);
        setValue("");
        clearFile();

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
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            data-testid="chat-composer"
            data-dragging={isDragging ? "true" : undefined}
            className={cn(
                "paddock-compose-box rounded-xl border-[1.5px] bg-paddock-paper",
                isOverLimit || fileError
                    ? "border-paddock-danger"
                    : "border-paddock-ink",
                isDragging && "border-dashed bg-paddock-sheet",
            )}
        >
            {file && (
                <div className="flex items-center gap-2.5 px-3 pt-3">
                    <span
                        data-testid="chat-pending-attachment"
                        className="flex min-w-0 items-center gap-2 rounded-paddock border border-paddock-rule bg-paddock-sheet py-1 pr-1 pl-2.5"
                    >
                        <FileText
                            aria-hidden="true"
                            className="size-4 shrink-0"
                            strokeWidth={1.8}
                        />
                        <span className="truncate text-sm font-semibold">
                            {file.name}
                        </span>
                        <span className="paddock-mono shrink-0 text-xs text-paddock-subtle">
                            {formatFileSize(file.size)}
                        </span>
                        <button
                            type="button"
                            onClick={clearFile}
                            aria-label={`Remove ${file.name}`}
                            className="paddock-press inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-paddock border-0 bg-transparent text-paddock-ink hover:bg-paddock-ink/10"
                        >
                            <X
                                aria-hidden="true"
                                className="size-3.5"
                                strokeWidth={2.4}
                            />
                        </button>
                    </span>
                </div>
            )}

            <textarea
                ref={textareaRef}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                disabled={disabled}
                rows={1}
                aria-label="Message"
                aria-describedby={fileError ? `${hintId} ${errorId}` : hintId}
                aria-invalid={isOverLimit ? true : undefined}
                data-testid="chat-composer-input"
                placeholder={placeholder}
                className="block max-h-[180px] min-h-12 w-full resize-none overflow-y-auto border-0 bg-transparent px-4 pt-3.5 pb-1.5 text-[0.9375rem] leading-normal font-medium text-paddock-ink placeholder:text-paddock-subtle disabled:cursor-not-allowed disabled:opacity-55"
            />

            {fileError && (
                <p
                    id={errorId}
                    role="alert"
                    data-testid="chat-attachment-error"
                    className="m-0 px-4 pb-1 text-[0.8125rem] font-semibold text-paddock-danger"
                >
                    {fileError}
                </p>
            )}

            <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-1 px-2 pt-1 pb-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={CHAT_ATTACHMENT_ACCEPT}
                    onChange={handleFileChange}
                    disabled={disabled}
                    hidden
                    data-testid="chat-attach-input"
                />
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    aria-label="Attach a file"
                    title="Attach a file — or drop or paste one here"
                    data-testid="chat-attach-button"
                    className="paddock-press mr-auto inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-paddock border-0 bg-transparent text-paddock-ink hover:bg-paddock-ink/10 disabled:cursor-not-allowed disabled:opacity-45"
                >
                    <Paperclip
                        aria-hidden="true"
                        className="size-4.5"
                        strokeWidth={2}
                    />
                </button>
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
