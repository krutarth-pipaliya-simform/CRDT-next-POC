"use client";

import { useRef, useState } from "react";
import Link from "next/link";

import { UserAvatar, type UserAvatarUser } from "@/components/ui/user-avatar";
import { logoutAction } from "@/features/auth/actions/logout";
import { useOutsideClick } from "@/hooks/use-outside-click";

export interface UserDropdownProps {
    user: UserAvatarUser;
}

export function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useOutsideClick(dropdownRef, () => setIsOpen(false), isOpen);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none cursor-pointer"
                aria-expanded={isOpen}
                aria-haspopup="true"
            >
                <UserAvatar user={user} size="lg" />
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-brand-surface border-2 border-brand-ink shadow-brand-card rounded-brand py-1 z-50 animate-fade-in-up">
                    <div className="px-4 py-2 border-b border-brand-border">
                        <p className="text-sm font-medium text-brand-ink truncate">
                            {user.name || "User"}
                        </p>
                        <p className="text-xs font-brand-mono text-brand-subtle truncate">
                            {user.email}
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        className="block px-4 py-2 text-xs font-brand-mono uppercase tracking-wider text-brand-ink hover:bg-brand-muted/60 transition-colors"
                        onClick={() => setIsOpen(false)}
                    >
                        Profile Settings
                    </Link>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full text-left block px-4 py-2 text-xs font-brand-mono uppercase tracking-wider text-brand-danger hover:bg-brand-danger/10 transition-colors cursor-pointer"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
