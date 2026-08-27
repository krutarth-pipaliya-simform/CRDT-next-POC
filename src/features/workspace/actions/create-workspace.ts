"use server";

import { redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { db } from "@/lib/db";
import { createWorkspaceSchema } from "@/schemas/workspace";

export async function createWorkspaceAction(
    state: unknown,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user?.id) {
        return { error: "Unauthorized" };
    }

    const data = Object.fromEntries(formData.entries());
    const validated = createWorkspaceSchema.safeParse(data);
    if (!validated.success) {
        return { error: validated.error.issues[0]?.message || "Invalid input" };
    }

    let workspace;
    try {
        workspace = await db.workspace.create({
            data: {
                name: validated.data.name,
                members: {
                    create: {
                        userId: session.user.id,
                        role: "ADMIN",
                    },
                },
            },
        });
    } catch {
        return { error: "Failed to create workspace" };
    }

    redirect(`/${workspace.id}`);
}
