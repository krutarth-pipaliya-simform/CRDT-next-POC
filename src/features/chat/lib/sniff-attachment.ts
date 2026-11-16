import type { ChatAttachmentSignature } from "@/schemas/chat";

import "server-only";

/** How much of a text file is checked for binary content. */
const TEXT_SNIFF_BYTES = 64 * 1024;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
    if (bytes.length < offset + signature.length) return false;
    return signature.every((byte, index) => bytes[offset + index] === byte);
}

function ascii(text: string): number[] {
    return Array.from(text, (char) => char.charCodeAt(0));
}

function looksLikeText(bytes: Uint8Array): boolean {
    const sample = bytes.subarray(0, TEXT_SNIFF_BYTES);
    if (sample.includes(0)) return false;

    try {
        // A multi-byte character cut off at the sample edge is not an error
        new TextDecoder("utf-8", { fatal: true }).decode(sample, {
            stream: sample.length < bytes.length,
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Checks that a file's bytes are what its extension claims. The extension
 * picks the expected signature from the allow-list; the browser's MIME type
 * is never consulted, because the client sets it.
 */
export function sniffAttachment(
    bytes: Uint8Array,
    signature: ChatAttachmentSignature,
): boolean {
    switch (signature) {
        case "png":
            return startsWith(
                bytes,
                [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
            );
        case "jpeg":
            return startsWith(bytes, [0xff, 0xd8, 0xff]);
        case "gif":
            return (
                startsWith(bytes, ascii("GIF87a")) ||
                startsWith(bytes, ascii("GIF89a"))
            );
        case "webp":
            return (
                startsWith(bytes, ascii("RIFF")) &&
                startsWith(bytes, ascii("WEBP"), 8)
            );
        case "pdf":
            return startsWith(bytes, ascii("%PDF-"));
        case "zip":
            // A local file header, or the end record of an empty archive
            return (
                startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) ||
                startsWith(bytes, [0x50, 0x4b, 0x05, 0x06])
            );
        case "text":
            return looksLikeText(bytes);
    }
}
