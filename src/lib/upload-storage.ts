import fs from "fs/promises";
import path from "path";

import "server-only";

/**
 * Local upload storage shared by every feature that keeps user files:
 * profile pictures, document images and chat attachments. Bytes live under
 * `storage/uploads/<folder>/…` and are served by `/api/uploads/[...path]`,
 * which is the only reader. Keep every write and delete going through here so
 * the URL format and the folder layout cannot drift apart.
 */
export const UPLOAD_URL_PREFIX = "/api/uploads/";

const UPLOAD_ROOT = path.join(process.cwd(), "storage", "uploads");

/** A path segment that is safe to join: no separators, no "." or "..". */
const SAFE_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Resolves URL segments to a file inside the upload root, or `null` when a
 * segment could climb out of it.
 */
export function resolveUploadPath(segments: string[]): string | null {
    if (segments.length === 0) return null;
    if (!segments.every((segment) => SAFE_SEGMENT.test(segment))) return null;

    const resolved = path.join(UPLOAD_ROOT, ...segments);
    return resolved.startsWith(UPLOAD_ROOT + path.sep) ? resolved : null;
}

/** Writes a file and returns the URL it is served from. */
export async function saveUpload(
    segments: string[],
    data: Uint8Array,
): Promise<string> {
    const filePath = resolveUploadPath(segments);
    if (!filePath) {
        throw new Error(`Unsafe upload path: ${segments.join("/")}`);
    }

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, data);

    return `${UPLOAD_URL_PREFIX}${segments.join("/")}`;
}

/** Reads a stored file, or `null` when it does not exist. */
export async function readUpload(segments: string[]): Promise<Buffer | null> {
    const filePath = resolveUploadPath(segments);
    if (!filePath) return null;

    try {
        return await fs.readFile(filePath);
    } catch {
        return null;
    }
}

/**
 * Deletes a stored file by its URL. External URLs (OAuth avatars) and missing
 * files are ignored; a failure is logged, never thrown.
 */
export async function deleteUpload(url: string | null): Promise<void> {
    if (!url || !url.startsWith(UPLOAD_URL_PREFIX)) return;

    const filePath = resolveUploadPath(
        url.slice(UPLOAD_URL_PREFIX.length).split("/"),
    );
    if (!filePath) return;

    try {
        await fs.unlink(filePath);
    } catch (error) {
        console.error("[Upload storage] Failed to delete", url, error);
    }
}
