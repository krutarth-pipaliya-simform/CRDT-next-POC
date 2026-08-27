import { headers } from "next/headers";

/**
 * Resolves the application base URL dynamically from incoming request headers.
 */
export async function getAppUrl(): Promise<string> {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const protocol =
        headersList.get("x-forwarded-proto") ??
        (host.startsWith("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
}
