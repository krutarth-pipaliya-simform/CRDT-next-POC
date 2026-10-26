"use client";

import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { Columns, Plus, Rows, Trash2 } from "lucide-react";

import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";

export interface TableControlsProps {
    editor: Editor | null;
}

interface TableActionProps {
    /** Hover hint; the visible text is the accessible name. */
    title: string;
    onClick: () => void;
    destructive?: boolean;
    children: ReactNode;
}

function TableAction({
    title,
    onClick,
    destructive = false,
    children,
}: TableActionProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={title}
            className={cn(
                "inline-flex h-11 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-semibold whitespace-nowrap transition-colors",
                destructive
                    ? "text-paddock-night-fg hover:bg-paddock-danger hover:text-paddock-on-danger"
                    : "text-paddock-night-fg hover:bg-paddock-night-fg/14",
            )}
        >
            {children}
        </button>
    );
}

const ICON = "size-3.5";

function Divider() {
    return (
        <span
            aria-hidden="true"
            className="mx-0.5 h-5 w-px bg-paddock-night-rule"
        />
    );
}

/** Row, column and table actions, shown under the toolbar while the caret is in a table. */
export function TableControls({ editor }: TableControlsProps) {
    if (!editor || !editor.isActive("table")) {
        return null;
    }

    return (
        <div
            role="toolbar"
            aria-label="Table controls"
            className="paddock-night flex w-fit max-w-full flex-wrap items-center justify-center gap-y-0.5 rounded-[1.75rem] p-1.5"
        >
            <Tag tone="night-subtle" className="px-3">
                Table
            </Tag>

            <TableAction
                title="Add row above"
                onClick={() => editor.chain().focus().addRowBefore().run()}
            >
                <Plus className={ICON} aria-hidden="true" />
                <Rows className={ICON} aria-hidden="true" />
                Row above
            </TableAction>
            <TableAction
                title="Add row below"
                onClick={() => editor.chain().focus().addRowAfter().run()}
            >
                <Plus className={ICON} aria-hidden="true" />
                <Rows className={ICON} aria-hidden="true" />
                Row below
            </TableAction>
            <TableAction
                title="Delete row"
                destructive
                onClick={() => editor.chain().focus().deleteRow().run()}
            >
                <Trash2 className={ICON} aria-hidden="true" />
                Delete row
            </TableAction>

            <Divider />

            <TableAction
                title="Add column before"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
            >
                <Plus className={ICON} aria-hidden="true" />
                <Columns className={ICON} aria-hidden="true" />
                Column left
            </TableAction>
            <TableAction
                title="Add column after"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
                <Plus className={ICON} aria-hidden="true" />
                <Columns className={ICON} aria-hidden="true" />
                Column right
            </TableAction>
            <TableAction
                title="Delete column"
                destructive
                onClick={() => editor.chain().focus().deleteColumn().run()}
            >
                <Trash2 className={ICON} aria-hidden="true" />
                Delete column
            </TableAction>

            <Divider />

            <TableAction
                title="Toggle header row"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            >
                Toggle header
            </TableAction>
            <TableAction
                title="Delete table"
                destructive
                onClick={() => editor.chain().focus().deleteTable().run()}
            >
                <Trash2 className={ICON} aria-hidden="true" />
                Delete table
            </TableAction>
        </div>
    );
}
