"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import { logoutAction } from "@/features/auth/actions/logout";

export interface UserDropdownProps {
    user: {
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

export function UserDropdown({ user }: UserDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                dropdownRef.current &&
                event.target instanceof Node &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const initials = user.name
        ? user.name.charAt(0).toUpperCase()
        : user.email?.charAt(0).toUpperCase() || "U";

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 focus:outline-none"
            >
                <div className="w-10 h-10 rounded-full overflow-hidden bg-brand-muted border border-brand-border flex items-center justify-center relative">
                    {user.image ? (
                        <Image
                            src={user.image}
                            alt="Avatar"
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <span className="text-brand-subtle font-semibold">
                            {initials}
                        </span>
                    )}
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-brand-border shadow-brand-subtle py-1 z-50">
                    <div className="px-4 py-2 border-b border-brand-border">
                        <p className="text-sm font-medium text-brand-ink truncate">
                            {user.name}
                        </p>
                        <p className="text-xs text-brand-subtle truncate">
                            {user.email}
                        </p>
                    </div>
                    <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-brand-ink hover:bg-brand-muted"
                        onClick={() => setIsOpen(false)}
                    >
                        Profile Settings
                    </Link>
                    <form action={logoutAction}>
                        <button
                            type="submit"
                            className="w-full text-left block px-4 py-2 text-sm text-brand-danger hover:bg-red-50"
                        >
                            Log Out
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
