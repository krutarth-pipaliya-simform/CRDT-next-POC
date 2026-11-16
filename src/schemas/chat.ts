import { z } from "zod";

export const MESSAGE_MAX_LENGTH = 2000;

/** One shared file per message is capped at this size (FR-11). */
export const CHAT_ATTACHMENT_MAX_BYTES = 8 * 1024 * 1024;

/**
 * Signature family a file's bytes must match, checked on the server by
 * `sniffAttachment`. The browser's MIME type is never trusted.
 */
export type ChatAttachmentSignature =
    "png" | "jpeg" | "gif" | "webp" | "pdf" | "zip" | "text";

export interface ChatAttachmentKind {
    /** Content type stored on the message and sent when the file is served. */
    contentType: string;
    signature: ChatAttachmentSignature;
    /** Rendered as a preview in the bubble rather than a download chip. */
    isImage: boolean;
}

/**
 * The chat allow-list, keyed by lower-case extension. SVG and HTML are left
 * out on purpose: both can carry script, and chat files are served from the
 * app's own origin.
 */
export const CHAT_ATTACHMENT_KINDS: Readonly<
    Record<string, ChatAttachmentKind>
> = {
    png: { contentType: "image/png", signature: "png", isImage: true },
    jpg: { contentType: "image/jpeg", signature: "jpeg", isImage: true },
    jpeg: { contentType: "image/jpeg", signature: "jpeg", isImage: true },
    gif: { contentType: "image/gif", signature: "gif", isImage: true },
    webp: { contentType: "image/webp", signature: "webp", isImage: true },
    pdf: { contentType: "application/pdf", signature: "pdf", isImage: false },
    txt: { contentType: "text/plain", signature: "text", isImage: false },
    md: { contentType: "text/markdown", signature: "text", isImage: false },
    csv: { contentType: "text/csv", signature: "text", isImage: false },
    zip: { contentType: "application/zip", signature: "zip", isImage: false },
    docx: {
        contentType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        signature: "zip",
        isImage: false,
    },
    xlsx: {
        contentType:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        signature: "zip",
        isImage: false,
    },
    pptx: {
        contentType:
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        signature: "zip",
        isImage: false,
    },
};

/** For the file picker's `accept` attribute. */
export const CHAT_ATTACHMENT_ACCEPT = Object.keys(CHAT_ATTACHMENT_KINDS)
    .map((extension) => `.${extension}`)
    .join(",");

export const CHAT_ATTACHMENT_TYPES_LABEL =
    "images (PNG, JPG, GIF, WebP), PDF, text, CSV, Markdown, ZIP and Office files";

export function chatAttachmentExtension(fileName: string): string {
    const dot = fileName.lastIndexOf(".");
    return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
}

export function chatAttachmentKind(
    fileName: string,
): ChatAttachmentKind | null {
    return CHAT_ATTACHMENT_KINDS[chatAttachmentExtension(fileName)] ?? null;
}

/** Whether a stored content type is shown inline as an image preview. */
export function isChatImageType(contentType: string): boolean {
    return Object.values(CHAT_ATTACHMENT_KINDS).some(
        (kind) => kind.isImage && kind.contentType === contentType,
    );
}

/**
 * Checks a file's name and size. Shared by the composer (to refuse a file
 * before uploading it) and the server action (which also checks the bytes).
 */
export const chatAttachmentSchema = z
    .instanceof(File, { message: "Attach a file" })
    .refine((file) => file.size > 0, "That file is empty")
    .refine(
        (file) => file.size <= CHAT_ATTACHMENT_MAX_BYTES,
        `Files can be up to ${CHAT_ATTACHMENT_MAX_BYTES / (1024 * 1024)} MB`,
    )
    .refine(
        (file) => file.name.length <= 200,
        "Rename the file to under 200 characters",
    )
    .refine(
        (file) => chatAttachmentKind(file.name) !== null,
        `That file type can't be shared. Allowed: ${CHAT_ATTACHMENT_TYPES_LABEL}.`,
    );

export const sendMessageSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    body: z
        .string()
        .trim()
        .max(
            MESSAGE_MAX_LENGTH,
            `Message cannot exceed ${MESSAGE_MAX_LENGTH} characters`,
        )
        .default(""),
    file: chatAttachmentSchema.optional(),
});

export const markChatReadSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    messageId: z.string().min(1, "Message ID is required"),
});

/**
 * Payloads read back out of the shared CRDT room. Any connected client can
 * write there, so each entry is parsed before it reaches the UI; an entry
 * that does not parse is ignored.
 */
const chatAuthorSchema = z.object({
    id: z.string().min(1),
    name: z.string().nullable(),
    email: z.string().nullable(),
    image: z.string().nullable(),
});

export const CHAT_ATTACHMENT_URL_PREFIX = "/api/uploads/chat/";

const chatAttachmentPayloadSchema = z.object({
    url: z.string().startsWith(CHAT_ATTACHMENT_URL_PREFIX),
    name: z.string().min(1),
    type: z.string().min(1),
    size: z.number().int().nonnegative(),
});

export const chatBroadcastSchema = z.object({
    id: z.string().min(1),
    body: z.string(),
    createdAt: z.iso.datetime(),
    author: chatAuthorSchema,
    // Entries written before file sharing existed carry no attachment field
    attachment: chatAttachmentPayloadSchema
        .nullish()
        .transform((value) => value ?? null),
});

export const chatReadReceiptSchema = z.object({
    user: chatAuthorSchema,
    lastReadAt: z.iso.datetime(),
});

export const getMessagesSchema = z.object({
    workspaceId: z.string().min(1, "Workspace ID is required"),
    before: z.string().optional(),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MarkChatReadInput = z.infer<typeof markChatReadSchema>;
export type GetMessagesInput = z.infer<typeof getMessagesSchema>;
