import Image from "next/image";
import { Download, FileText } from "lucide-react";

import { isChatImageType } from "@/schemas/chat";

import { formatFileSize } from "../lib/format-file-size";
import type { ChatAttachment } from "../types";

export interface MessageAttachmentProps {
    attachment: ChatAttachment;
    /** False while the file is still uploading: there is nothing to open yet. */
    isAvailable: boolean;
}

/**
 * The shared file in a chat bubble. An image is a preview that opens full
 * size; anything else is a named download chip with its size. Both point at
 * `/api/uploads/chat/…`, which only serves members of the workspace, so the
 * image is never routed through the image optimiser (it would fetch without
 * the reader's session).
 */
export function MessageAttachment({
    attachment,
    isAvailable,
}: MessageAttachmentProps) {
    const size = formatFileSize(attachment.size);

    if (isAvailable && isChatImageType(attachment.type)) {
        return (
            <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="chat-attachment"
                data-kind="image"
                className="mt-1.5 block w-fit max-w-full overflow-hidden rounded-paddock border border-paddock-rule"
            >
                <Image
                    src={attachment.url}
                    alt={attachment.name}
                    width={0}
                    height={0}
                    sizes="100vw"
                    unoptimized
                    data-testid="chat-attachment-preview"
                    className="block h-auto max-h-64 w-auto max-w-full bg-paddock-paper object-contain"
                />
            </a>
        );
    }

    const content = (
        <>
            <FileText
                aria-hidden="true"
                className="size-5 shrink-0 text-paddock-ink"
                strokeWidth={1.8}
            />
            <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-paddock-ink">
                    {attachment.name}
                </span>
                <span className="paddock-mono block text-xs text-paddock-subtle">
                    {isAvailable ? size : `${size} · uploading`}
                </span>
            </span>
            {isAvailable && (
                <Download
                    aria-hidden="true"
                    className="size-4 shrink-0 text-paddock-ink"
                    strokeWidth={2}
                />
            )}
        </>
    );

    const chipClass =
        "mt-1.5 flex w-full max-w-sm items-center gap-3 rounded-paddock border border-paddock-rule bg-paddock-paper px-3 py-2.5";

    if (!isAvailable) {
        return (
            <div data-testid="chat-attachment" className={chipClass}>
                {content}
            </div>
        );
    }

    return (
        <a
            href={attachment.url}
            download={attachment.name}
            data-testid="chat-attachment"
            data-kind="file"
            aria-label={`Download ${attachment.name}, ${size}`}
            className={`${chipClass} paddock-press min-h-11 no-underline hover:bg-paddock-ink/5`}
        >
            {content}
        </a>
    );
}
