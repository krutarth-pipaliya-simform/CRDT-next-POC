"use server";

import { signOut } from "@/features/auth/lib/auth";

export async function logoutAction() {
    await signOut({ redirectTo: "/login" });
}
