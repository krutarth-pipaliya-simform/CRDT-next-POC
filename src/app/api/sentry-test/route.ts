export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

/**
 * Throws on purpose so a developer can confirm server errors reach Sentry
 * (`onRequestError`). Development only: production answers 404.
 */
export async function GET(): Promise<Response> {
    if (process.env.NODE_ENV === "production") {
        return new Response("Not Found", { status: 404 });
    }

    throw new Error("Sentry verification: server route handler error");
}
