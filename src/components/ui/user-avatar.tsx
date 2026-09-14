import Image from "next/image";

import { cn } from "@/lib/cn";
import { presenceVar } from "@/lib/presence";

export interface UserAvatarUser {
    /**
     * Seeds the person's presence hue. Falls back to email, then name, so an
     * avatar still colours consistently where only a display name is loaded.
     */
    id?: string | null;
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

/** The most stable identifier available, so one person keeps one hue. */
function presenceKey(user?: UserAvatarUser | null): string {
    return user?.id || user?.email || user?.name || "anonymous";
}

/**
 * Square, not circular — the 0px radius is the system's signature and avatars
 * are no exception. Squares also tile cleanly into the overlapping stacks used
 * for "who is here", where circles leave gaps.
 *
 * An avatar without a photo is filled with the person's own presence hue, which
 * is the same colour as their cursor in a document and their rail in chat.
 */
export function UserAvatar({ user, size = "md", className }: UserAvatarProps) {
    const initials = getUserInitials(user);

    const sizeClasses = {
        sm: "w-6 h-6 text-[11px]",
        md: "w-8 h-8 text-[13px]",
        lg: "w-10 h-10 text-[15px]",
    }[size];

    return (
        <div
            className={cn(
                "rounded-brand overflow-hidden font-semibold flex items-center justify-center relative shrink-0 uppercase select-none",
                sizeClasses,
                className,
            )}
            style={
                user?.image
                    ? undefined
                    : {
                          backgroundColor: presenceVar(presenceKey(user)),
                          color: "var(--color-brand-on-fill)",
                      }
            }
        >
            {user?.image ? (
                <Image
                    src={user.image}
                    alt={user.name || user.email || "Avatar"}
                    fill
                    className="object-cover"
                />
            ) : (
                <span aria-hidden="true">{initials}</span>
            )}
        </div>
    );
}
