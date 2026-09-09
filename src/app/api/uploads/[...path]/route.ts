import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ path: string[] }> },
) {
    try {
        const resolvedParams = await params;
        const filePath = path.join(
            process.cwd(),
            "storage",
            "uploads",
            ...resolvedParams.path,
        );
        const fileBuffer = await fs.readFile(filePath);

        const extension = path.extname(filePath).slice(1).toLowerCase();
        const contentTypes: Record<string, string> = {
            jpg: "image/jpeg",
            jpeg: "image/jpeg",
            png: "image/png",
            webp: "image/webp",
            gif: "image/gif",
            svg: "image/svg+xml",
            avif: "image/avif",
        };
        const contentType =
            contentTypes[extension] || "application/octet-stream";

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000",
            },
        });
    } catch {
        return new NextResponse("Not Found", { status: 404 });
    }
}
