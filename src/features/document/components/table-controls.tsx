"use client";

import type { Editor } from "@tiptap/react";
import { Columns, Plus, Rows, Trash2 } from "lucide-react";

export interface TableControlsProps {
    editor: Editor | null;
}

export function TableControls({ editor }: TableControlsProps) {
    if (!editor || !editor.isActive("table")) {
        return null;
    }

    return (
        <div
            role="toolbar"
            aria-label="Table Controls"
            className="flex flex-wrap items-center gap-1 p-1 bg-brand-surface border border-brand-border rounded-brand text-xs font-brand-mono shadow-brand-subtle my-2"
        >
            <span className="px-2 text-brand-subtle font-bold uppercase text-[10px]">
                Table:
            </span>

            {/* Row Actions */}
            <button
                type="button"
                onClick={() => editor.chain().focus().addRowBefore().run()}
                title="Add Row Above"
                aria-label="Add Row Above"
                className="flex items-center gap-1 px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-ink rounded-brand transition-colors"
            >
                <Plus
                    className="w-3 h-3 text-brand-accent"
                    aria-hidden="true"
                />
                <Rows className="w-3 h-3" aria-hidden="true" />
                <span>Row Above</span>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().addRowAfter().run()}
                title="Add Row Below"
                aria-label="Add Row Below"
                className="flex items-center gap-1 px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-ink rounded-brand transition-colors"
            >
                <Plus
                    className="w-3 h-3 text-brand-accent"
                    aria-hidden="true"
                />
                <Rows className="w-3 h-3" aria-hidden="true" />
                <span>Row Below</span>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().deleteRow().run()}
                title="Delete Row"
                aria-label="Delete Row"
                className="flex items-center gap-1 px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-danger rounded-brand transition-colors"
            >
                <Trash2
                    className="w-3 h-3 text-brand-danger"
                    aria-hidden="true"
                />
                <span>Delete Row</span>
            </button>

            <div
                className="w-[1px] h-4 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Column Actions */}
            <button
                type="button"
                onClick={() => editor.chain().focus().addColumnBefore().run()}
                title="Add Column Before"
                aria-label="Add Column Before"
                className="flex items-center gap-1 px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-ink rounded-brand transition-colors"
            >
                <Plus
                    className="w-3 h-3 text-brand-accent"
                    aria-hidden="true"
                />
                <Columns className="w-3 h-3" aria-hidden="true" />
                <span>Col Left</span>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().addColumnAfter().run()}
                title="Add Column After"
                aria-label="Add Column After"
                className="flex items-center gap-1 px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-ink rounded-brand transition-colors"
            >
                <Plus
                    className="w-3 h-3 text-brand-accent"
                    aria-hidden="true"
                />
                <Columns className="w-3 h-3" aria-hidden="true" />
                <span>Col Right</span>
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().deleteColumn().run()}
                title="Delete Column"
                aria-label="Delete Column"
                className="flex items-center gap-1 px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-danger rounded-brand transition-colors"
            >
                <Trash2
                    className="w-3 h-3 text-brand-danger"
                    aria-hidden="true"
                />
                <span>Delete Col</span>
            </button>

            <div
                className="w-[1px] h-4 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Header and Delete Table */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeaderRow().run()}
                title="Toggle Header Row"
                aria-label="Toggle Header Row"
                className="px-2 py-1 bg-brand-muted hover:bg-brand-border border border-brand-border text-brand-ink rounded-brand transition-colors"
            >
                Toggle Header
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().deleteTable().run()}
                title="Delete Table"
                aria-label="Delete Table"
                className="flex items-center gap-1 px-2 py-1 bg-brand-danger/10 hover:bg-brand-danger/20 border border-brand-danger text-brand-danger rounded-brand transition-colors"
            >
                <Trash2 className="w-3 h-3" aria-hidden="true" />
                <span>Delete Table</span>
            </button>
        </div>
    );
}
