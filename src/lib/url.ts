import { headers } from "next/headers";

/**
 * Resolves the application base URL dynamically from incoming request headers.
 */
export async function getAppUrl(): Promise<string> {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost:3000";
    const isLocalNetwork =
        host.startsWith("localhost") ||
        host.startsWith("127.0.0.1") ||
        host.startsWith("172.") ||
        host.startsWith("192.168.") ||
        host.startsWith("10.");
    const protocol =
        headersList.get("x-forwarded-proto") ??
        (isLocalNetwork ? "http" : "https");
    return `${protocol}://${host}`;
}
