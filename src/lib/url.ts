import { headers } from "next/headers";

/**
 * Resolves the application base URL: the configured `APP_URL` when there is
 * one, otherwise the incoming request's headers. Set `APP_URL` in production,
 * because the Host header is client-controlled and a password reset link
 * built from it can be pointed at another site.
 */
export async function getAppUrl(): Promise<string> {
    const configured = process.env.APP_URL;
    if (configured) {
        return configured.replace(/\/+$/, "");
    }

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
