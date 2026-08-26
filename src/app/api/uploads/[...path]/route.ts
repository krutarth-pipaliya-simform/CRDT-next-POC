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

        const extension = path.extname(filePath).slice(1);
        const contentType =
            extension === "jpg" || extension === "jpeg"
                ? "image/jpeg"
                : extension === "png"
                  ? "image/png"
                  : extension === "webp"
                    ? "image/webp"
                    : "application/octet-stream";

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
