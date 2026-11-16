"use client";

import { useRef, type KeyboardEvent } from "react";
import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { logoutAction } from "@/features/auth/actions/logout";
import { profileHref } from "@/features/profile/lib/profile-href";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { useShellPanel } from "@/stores/shell-ui-store";

export interface AccountMenuProps {
    user: {
        id: string;
        name: string;
        email: string | null;
        image: string | null;
    };
}

const itemClasses =
    "flex w-full cursor-pointer items-center gap-3 border-0 bg-transparent px-4 py-3 text-left text-[0.9375rem] font-semibold text-paddock-ink no-underline transition-colors hover:bg-paddock-ink/6";

/**
 * The caller's own face in the header. It opens a small menu with who is
 * signed in, their profile and logging out, so leaving never depends on
 * finding the full-screen menu.
 */
export function AccountMenu({ user }: AccountMenuProps) {
    const { open, toggle, close } = useShellPanel("account");
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    useOutsideClick(containerRef, close, open);

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "Escape" && open) {
            event.stopPropagation();
            close();
        }
    }

    return (
        <div
            ref={containerRef}
            onKeyDown={handleKeyDown}
            className="relative shrink-0"
        >
            <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-haspopup="true"
                aria-label={`Account menu, ${user.name}`}
                className="paddock-press flex cursor-pointer rounded-full border-0 bg-transparent p-0"
            >
                <PaddockAvatar person={user} size="xl" decorative />
            </button>

            {open ? (
                <div className="paddock-in absolute top-[calc(100%+0.5rem)] right-0 z-50 w-64 max-w-[calc(100vw-2rem)] overflow-hidden rounded-paddock-card border-[1.5px] border-paddock-ink bg-paddock-sheet shadow-paddock-float">
                    <div className="border-b border-paddock-rule px-4 py-3.5">
                        <p className="m-0 truncate font-bold">{user.name}</p>
                        {user.email ? (
                            <p className="paddock-mono m-0 truncate text-xs text-paddock-subtle">
                                {user.email}
                            </p>
                        ) : null}
                    </div>
                    <Link
                        href={profileHref(pathname)}
                        onClick={close}
                        className={itemClasses}
                    >
                        <UserRound
                            aria-hidden="true"
                            className="size-4"
                            strokeWidth={2}
                        />
                        Profile
                    </Link>
                    <form
                        action={logoutAction}
                        className="border-t border-paddock-rule"
                    >
                        <button type="submit" className={itemClasses}>
                            <LogOut
                                aria-hidden="true"
                                className="size-4"
                                strokeWidth={2}
                            />
                            Log out
                        </button>
                    </form>
                </div>
            ) : null}
        </div>
    );
}
