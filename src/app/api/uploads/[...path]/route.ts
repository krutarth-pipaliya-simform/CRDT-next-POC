import { NextResponse } from "next/server";

import { auth } from "@/features/auth/lib/auth";
import { getWorkspaceRole } from "@/features/workspace/lib/rbac";
import { db } from "@/lib/db";
import { readUpload, UPLOAD_URL_PREFIX } from "@/lib/upload-storage";
import { isChatImageType } from "@/schemas/chat";

const PUBLIC_CONTENT_TYPES: Record<string, string> = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    svg: "image/svg+xml",
    avif: "image/avif",
};

function notFound() {
    return new NextResponse("Not Found", { status: 404 });
}

/** RFC 6266 filename, with an ASCII fallback for old clients. */
function contentDisposition(kind: "inline" | "attachment", name: string) {
    const fallback = name.replace(/[^\x20-\x7e]|["\\]/g, "_");
    return `${kind}; filename="${fallback}"; filename*=UTF-8''${encodeURIComponent(name)}`;
}

/**
 * Chat files are private to the workspace. The file is served only when a
 * message row points at it and the caller may read that workspace's chat;
 * anyone else gets the same 404 as a missing file, so the URL reveals nothing.
 */
async function serveChatFile(segments: string[]) {
    const session = await auth();
    if (!session?.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    // Stored as chat/<workspaceId>/<file>; the workspace narrows the lookup
    const message = await db.message.findFirst({
        where: {
            workspaceId: segments[1],
            attachmentUrl: `${UPLOAD_URL_PREFIX}${segments.join("/")}`,
        },
        select: {
            workspaceId: true,
            attachmentName: true,
            attachmentType: true,
        },
    });
    if (!message) return notFound();

    const role = await getWorkspaceRole(message.workspaceId);
    if (!role) return notFound();

    const file = await readUpload(segments);
    if (!file) return notFound();

    const contentType = message.attachmentType ?? "application/octet-stream";
    const name = message.attachmentName ?? segments[segments.length - 1];

    return new NextResponse(new Uint8Array(file), {
        headers: {
            "Content-Type": contentType,
            "Content-Disposition": contentDisposition(
                isChatImageType(contentType) ? "inline" : "attachment",
                name,
            ),
            // Membership can be revoked, so a copy is revalidated before reuse
            "Cache-Control": "private, no-cache",
            "X-Content-Type-Options": "nosniff",
            "Content-Security-Policy": "sandbox; default-src 'none'",
        },
    });
}

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ path: string[] }> },
) {
    const { path: segments } = await params;

    if (segments[0] === "chat") {
        return serveChatFile(segments);
    }

    const file = await readUpload(segments);
    if (!file) return notFound();

    const extension =
        segments[segments.length - 1].split(".").pop()?.toLowerCase() ?? "";

    return new NextResponse(new Uint8Array(file), {
        headers: {
            "Content-Type":
                PUBLIC_CONTENT_TYPES[extension] || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000",
        },
    });
}
