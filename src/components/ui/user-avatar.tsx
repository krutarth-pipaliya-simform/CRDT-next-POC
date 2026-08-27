import Image from "next/image";

import { cn } from "@/lib/cn";

export interface UserAvatarUser {
    name?: string | null;
    email?: string | null;
    image?: string | null;
}

export interface UserAvatarProps {
    user?: UserAvatarUser | null;
    size?: "sm" | "md" | "lg";
    className?: string;
}

/**
 * Extracts uppercase 1-character initial from user name or email with a fallback.
 */
export function getUserInitials(user?: UserAvatarUser | null): string {
    if (!user) return "U";
    if (user.name && user.name.trim().length > 0) {
        return user.name.trim().charAt(0).toUpperCase();
    }
    if (user.email && user.email.trim().length > 0) {
        return user.email.trim().charAt(0).toUpperCase();
    }
    return "U";
}

export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
    const initials = getUserInitials(user);

    const sizeClasses = {
        sm: "w-7 h-7 text-xs",
        md: "w-8 h-8 text-xs",
        lg: "w-10 h-10 text-sm",
    }[size];

    return (
        <div
            className={cn(
                "rounded-full overflow-hidden bg-brand-ink text-brand-surface font-brand-mono font-semibold flex items-center justify-center relative shrink-0 uppercase shadow-brand-subtle",
                sizeClasses,
                className,
            )}
        >
            {user?.image ? (
                <Image
                    src={user.image}
                    alt={user.name || user.email || "Avatar"}
                    fill
                    className="object-cover"
                />
            ) : (
                <span>{initials}</span>
            )}
        </div>
    );
}
