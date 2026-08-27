import { redirect } from "next/navigation";

import { auth } from "@/features/auth/lib/auth";
import { PasswordForm } from "@/features/profile/components/password-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ProfilePicture } from "@/features/profile/components/profile-picture";
import { db } from "@/lib/db";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user?.id) {
        redirect("/login");
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
    });

    if (!user) {
        redirect("/login");
    }

    // Determine initials
    const initials = user.name
        ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : user.email?.substring(0, 2).toUpperCase() || "U";

    return (
        <div className="max-w-4xl mx-auto space-y-8 p-6">
            <div>
                <h1 className="text-3xl font-brand-mono font-bold text-brand-ink uppercase tracking-tight">
                    Account Settings
                </h1>
                <p className="text-brand-ink/70 mt-2 font-brand-sans">
                    Manage your personal information and account preferences.
                </p>
            </div>

            <ProfilePicture initialImageUrl={user.image} initials={initials} />

            <ProfileForm initialName={user.name || ""} />

            <PasswordForm />
        </div>
    );
}
