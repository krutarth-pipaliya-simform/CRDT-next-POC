import { redirect } from "next/navigation";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { PageHeader } from "@/components/layout/page-header";
import { auth } from "@/features/auth/lib/auth";
import { PasswordForm } from "@/features/profile/components/password-form";
import { ProfileForm } from "@/features/profile/components/profile-form";
import { ProfilePicture } from "@/features/profile/components/profile-picture";
import { resolveProfileBackLink } from "@/features/profile/lib/resolve-profile-back-link";
import { profileSearchParamsSchema } from "@/features/profile/schemas";
import { db } from "@/lib/db";

export interface ProfilePageProps {
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ProfilePage({ searchParams }: ProfilePageProps) {
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

    // Back to wherever profile was opened from, so leaving it never costs
    // the workspace the user was in.
    const { from } = profileSearchParamsSchema.parse(await searchParams);
    const back = await resolveProfileBackLink(from);

    // Determine initials
    const initials = user.name
        ? user.name
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .substring(0, 2)
              .toUpperCase()
        : user.email?.substring(0, 2).toUpperCase() || "U";

    const identity = [user.name, user.email].filter(Boolean).join(" · ");

    return (
        <main className="pb-24">
            <PageHeader
                back={back}
                eyebrow={identity || undefined}
                serif="Account"
                heavy="Settings"
                action={
                    <p className="m-0 max-w-[21.25rem] text-paddock-subtle">
                        Manage your personal information and account
                        preferences.
                    </p>
                }
            />

            <div className={`${PAGE_CONTAINER} flex flex-col`}>
                <ProfilePicture
                    initialImageUrl={user.image}
                    initials={initials}
                    userId={user.id}
                />

                <ProfileForm initialName={user.name || ""} />

                <PasswordForm />
            </div>
        </main>
    );
}
