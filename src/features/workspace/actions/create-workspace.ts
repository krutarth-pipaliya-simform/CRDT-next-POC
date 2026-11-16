"use server";

import { Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

import { auth, signOut } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { reportError } from "@/lib/report-error";
import { createWorkspaceSchema } from "@/schemas/workspace";

/**
 * Success redirects to the new workspace, so only failures come back. `field`
 * says whether the problem is the name (shown under the input) or the request
 * as a whole (shown above the actions); `name` is what was typed, so the form
 * can keep it after React resets it.
 */
export type CreateWorkspaceResult = {
    success: false;
    error: string;
    field: "name" | null;
    /** True when the fix is to log in again, so the form can link to it. */
    sessionEnded: boolean;
    name: string;
} | null;

const SESSION_ENDED =
    "Your session has ended, so the workspace was not created. Log in again to continue.";

export async function createWorkspaceAction(
    state: unknown,
    formData: FormData,
): Promise<CreateWorkspaceResult> {
    const rawName = formData.get("name");
    const name = typeof rawName === "string" ? rawName : "";

    const session = await auth();
    if (!session?.user?.id) {
        return {
            success: false,
            error: SESSION_ENDED,
            field: null,
            sessionEnded: true,
            name,
        };
    }

    const validated = createWorkspaceSchema.safeParse(
        Object.fromEntries(formData.entries()),
    );
    if (!validated.success) {
        return {
            success: false,
            error: validated.error.issues[0]?.message ?? "Invalid name",
            field: "name",
            sessionEnded: false,
            name,
        };
    }

    let workspaceId: string;
    try {
        const workspace = await db.workspace.create({
            data: {
                name: validated.data.name,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "ADMIN",
                    },
                },
            },
            select: { id: true },
        });
        workspaceId = workspace.id;
    } catch (error) {
        // P2003: the membership row points at a user that no longer exists —
        // a session that outlived its account. Anything else is unexpected.
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2003"
        ) {
            // Clear the dead session now. Otherwise, until the periodic user
            // check runs, the proxy still treats it as signed in and bounces
            // the "Log in" link straight back to the dashboard.
            await signOut({ redirect: false });
            return {
                success: false,
                error: SESSION_ENDED,
                field: null,
                sessionEnded: true,
                name,
            };
        }

        reportError("[workspace] create failed", error);
        return {
            success: false,
            error: "The workspace could not be created because of a server problem. Try again in a moment.",
            field: null,
            sessionEnded: false,
            name,
        };
    }

    redirect(`/${workspaceId}`);
}
