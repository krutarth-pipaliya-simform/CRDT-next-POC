"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { BurgerButton } from "@/components/paddock/paddock-button";
import {
    MenuOverlay,
    type MenuOverlayItem,
} from "@/components/paddock/menu-overlay";
import { Tag } from "@/components/paddock/tag";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { logoutAction } from "@/features/auth/actions/logout";
import { CONTENT_SECTIONS } from "@/features/cms/lib/content-sections";
import { profileHref } from "@/features/profile/lib/profile-href";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";
import { WORKSPACE_ROLE_LABELS } from "@/schemas/workspace";
import { useShellPanel } from "@/stores/shell-ui-store";

import type { ShellRecentDocument, ShellWorkspace } from "./types";
import { isSectionCurrent, workspaceSections } from "./workspace-sections";

const MENU_ID = "app-menu";

export interface AppMenuProps {
    workspaces: ShellWorkspace[];
    recentDocuments: ShellRecentDocument[];
}

const footerLink =
    "paddock-tag text-[0.6875rem] text-paddock-night-fg no-underline underline-offset-4 hover:underline";

/**
 * The burger and the full-screen menu it opens. Inside a workspace the menu
 * lists that workspace's sections; elsewhere it lists the account pages. The
 * footer carries the theme control, so it is one tap away on every page.
 */
export function AppMenu({ workspaces, recentDocuments }: AppMenuProps) {
    const { open, toggle, close } = useShellPanel("menu");
    const pathname = usePathname();
    const { workspaceId, workspace } = useCurrentWorkspace(workspaces);

    const workspacesItem: MenuOverlayItem = {
        label: "Workspaces",
        href: "/dashboard",
        current: pathname === "/dashboard",
    };

    const items: MenuOverlayItem[] = workspaceId
        ? [
              ...workspaceSections(workspaceId, workspace?.role ?? null).map(
                  (section) => ({
                      label: section.label,
                      href: section.href,
                      current: isSectionCurrent(pathname, section),
                  }),
              ),
              workspacesItem,
          ]
        : [
              workspacesItem,
              {
                  label: "Profile",
                  href: profileHref(pathname),
                  current: pathname === "/profile",
              },
          ];

    return (
        <>
            <BurgerButton open={open} controls={MENU_ID} onClick={toggle} />
            <MenuOverlay
                id={MENU_ID}
                open={open}
                onClose={close}
                items={items}
                cards={recentDocuments.map((document) => ({
                    title: document.title,
                    meta: document.meta,
                }))}
                footer={
                    <>
                        {workspace ? (
                            <Tag tone="night-subtle">
                                {workspace.name} ·{" "}
                                {WORKSPACE_ROLE_LABELS[workspace.role]}
                            </Tag>
                        ) : null}
                        <div className="flex flex-wrap items-center justify-center gap-x-5.5 gap-y-2">
                            <Link
                                href={profileHref(pathname)}
                                onClick={close}
                                className={footerLink}
                            >
                                Profile
                            </Link>
                            <Link
                                href="/dashboard"
                                onClick={close}
                                className={footerLink}
                            >
                                All workspaces
                            </Link>
                            {CONTENT_SECTIONS.map((section) => (
                                <Link
                                    key={section.href}
                                    href={section.href}
                                    onClick={close}
                                    className={footerLink}
                                >
                                    {section.label}
                                </Link>
                            ))}
                            <form action={logoutAction}>
                                <button
                                    type="submit"
                                    className={`${footerLink} cursor-pointer border-0 bg-transparent p-0`}
                                >
                                    Log out
                                </button>
                            </form>
                        </div>
                        <ThemeToggle surface="night" className="mt-2" />
                    </>
                }
            />
        </>
    );
}
