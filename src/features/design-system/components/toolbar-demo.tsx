"use client";

import { useState } from "react";
import {
    Bold,
    Code,
    Heading2,
    Italic,
    Link2,
    List,
    ListChecks,
    Redo2,
    Underline,
    Undo2,
} from "lucide-react";

import {
    FloatingToolbar,
    type FloatingToolbarItem,
} from "@/components/paddock/floating-toolbar";

type FormatId =
    | "bold"
    | "italic"
    | "underline"
    | "code"
    | "heading"
    | "bullets"
    | "tasks"
    | "link";

const ICON_CLASS = "size-4";

/** The editor's formatting pill, with real toggles and a disabled redo. */
export function ToolbarDemo() {
    const [active, setActive] = useState<Set<string>>(
        () => new Set(["bold", "heading"]),
    );

    function toggle(id: string) {
        setActive((current) => {
            const next = new Set(current);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    }

    const item = (
        id: FormatId,
        label: string,
        icon: FloatingToolbarItem["icon"],
    ): FloatingToolbarItem => ({
        id,
        label,
        icon,
        pressed: active.has(id),
    });

    const groups: FloatingToolbarItem[][] = [
        [
            {
                id: "undo",
                label: "Undo",
                icon: <Undo2 className={ICON_CLASS} />,
            },
            {
                id: "redo",
                label: "Redo",
                icon: <Redo2 className={ICON_CLASS} />,
                disabled: true,
            },
        ],
        [
            item("bold", "Bold", <Bold className={ICON_CLASS} />),
            item("italic", "Italic", <Italic className={ICON_CLASS} />),
            item(
                "underline",
                "Underline",
                <Underline className={ICON_CLASS} />,
            ),
            item("code", "Inline code", <Code className={ICON_CLASS} />),
        ],
        [
            item("heading", "Heading", <Heading2 className={ICON_CLASS} />),
            item("bullets", "Bulleted list", <List className={ICON_CLASS} />),
            item("tasks", "Checklist", <ListChecks className={ICON_CLASS} />),
            item("link", "Link", <Link2 className={ICON_CLASS} />),
        ],
    ];

    return (
        <FloatingToolbar
            label="Formatting"
            groups={groups}
            onToggle={(id) => {
                if (id !== "undo" && id !== "redo") toggle(id);
            }}
        />
    );
}
