"use client";

import { useState } from "react";
import type { Editor } from "@tiptap/react";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Highlighter,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    ListTodo,
    Minus,
    Quote,
    Redo2,
    Strikethrough,
    Table as TableIcon,
    Type,
    Underline,
    Undo2,
} from "lucide-react";

export interface EditorToolbarProps {
    editor: Editor | null;
    onOpenImageDialog: () => void;
    disabled?: boolean;
}

export function EditorToolbar({
    editor,
    onOpenImageDialog,
    disabled = false,
}: EditorToolbarProps) {
    const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    if (!editor) {
        return null;
    }

    const setLink = () => {
        if (disabled) return;
        if (!linkUrl) {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
        } else {
            editor
                .chain()
                .focus()
                .extendMarkRange("link")
                .setLink({ href: linkUrl })
                .run();
        }
        setIsLinkPromptOpen(false);
        setLinkUrl("");
    };

    return (
        <div
            role="toolbar"
            aria-label="Editor formatting toolbar"
            aria-disabled={disabled}
            className={`flex flex-wrap items-center gap-1 p-2 bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-subtle max-w-full overflow-x-auto no-scrollbar transition-opacity duration-150 ${
                disabled
                    ? "opacity-50 pointer-events-none cursor-not-allowed"
                    : ""
            }`}
        >
            {/* Undo / Redo */}
            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
                title="Undo (Mod-Z)"
                aria-label="Undo"
                className="p-1.5 rounded-brand hover:bg-brand-muted disabled:opacity-30 disabled:hover:bg-transparent text-brand-ink transition-colors"
            >
                <Undo2 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
                title="Redo (Mod-Shift-Z)"
                aria-label="Redo"
                className="p-1.5 rounded-brand hover:bg-brand-muted disabled:opacity-30 disabled:hover:bg-transparent text-brand-ink transition-colors"
            >
                <Redo2 className="w-4 h-4" aria-hidden="true" />
            </button>

            <div
                className="w-[1px] h-5 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Block Type Selectors */}
            <button
                type="button"
                onClick={() => editor.chain().focus().setParagraph().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("paragraph")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Paragraph"
                aria-label="Paragraph"
            >
                <Type className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 1 }).run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("heading", { level: 1 })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Heading 1 (Mod-Alt-1)"
                aria-label="Heading 1"
            >
                <Heading1 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 2 }).run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("heading", { level: 2 })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Heading 2 (Mod-Alt-2)"
                aria-label="Heading 2"
            >
                <Heading2 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 3 }).run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("heading", { level: 3 })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Heading 3 (Mod-Alt-3)"
                aria-label="Heading 3"
            >
                <Heading3 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().toggleHeading({ level: 4 }).run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("heading", { level: 4 })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Heading 4 (Mod-Alt-4)"
                aria-label="Heading 4"
            >
                <Heading4 className="w-4 h-4" aria-hidden="true" />
            </button>

            <div
                className="w-[1px] h-5 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Inline Formatting */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("bold")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Bold (Mod-B)"
                aria-label="Bold"
            >
                <Bold className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("italic")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Italic (Mod-I)"
                aria-label="Italic"
            >
                <Italic className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("underline")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Underline (Mod-U)"
                aria-label="Underline"
            >
                <Underline className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("strike")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Strikethrough (Mod-Shift-S)"
                aria-label="Strikethrough"
            >
                <Strikethrough className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("code")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Inline Code (Mod-E)"
                aria-label="Inline Code"
            >
                <Code className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHighlight().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("highlight")
                        ? "bg-brand-accent text-white"
                        : "text-brand-ink"
                }`}
                title="Highlight (Mod-Shift-H)"
                aria-label="Highlight"
            >
                <Highlighter className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => {
                    const previousUrl = editor.getAttributes("link").href;
                    setLinkUrl(previousUrl || "");
                    setIsLinkPromptOpen(true);
                }}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("link")
                        ? "bg-brand-accent text-white"
                        : "text-brand-ink"
                }`}
                title="Link (Mod-K)"
                aria-label="Link"
            >
                <LinkIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <div
                className="w-[1px] h-5 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Alignment */}
            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().setTextAlign("left").run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive({ textAlign: "left" })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Align Left"
                aria-label="Align Left"
            >
                <AlignLeft className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().setTextAlign("center").run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive({ textAlign: "center" })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Align Center"
                aria-label="Align Center"
            >
                <AlignCenter className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().setTextAlign("right").run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive({ textAlign: "right" })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Align Right"
                aria-label="Align Right"
            >
                <AlignRight className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() =>
                    editor.chain().focus().setTextAlign("justify").run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive({ textAlign: "justify" })
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Align Justify"
                aria-label="Align Justify"
            >
                <AlignJustify className="w-4 h-4" aria-hidden="true" />
            </button>

            <div
                className="w-[1px] h-5 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Lists & Blocks */}
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("bulletList")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Bullet List (Mod-Shift-8)"
                aria-label="Bullet List"
            >
                <List className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("orderedList")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Numbered List (Mod-Shift-7)"
                aria-label="Numbered List"
            >
                <ListOrdered className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("taskList")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Checklist / Task List (Mod-Shift-9)"
                aria-label="Checklist"
            >
                <ListTodo className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("codeBlock")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Code Block (Mod-Alt-C)"
                aria-label="Code Block"
            >
                <Code2 className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("blockquote")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Blockquote (Mod-Shift-B)"
                aria-label="Blockquote"
            >
                <Quote className="w-4 h-4" aria-hidden="true" />
            </button>

            <div
                className="w-[1px] h-5 bg-brand-border mx-1"
                aria-hidden="true"
            />

            {/* Table & Image & Rule */}
            <button
                type="button"
                onClick={() =>
                    editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run()
                }
                className={`p-1.5 rounded-brand hover:bg-brand-muted transition-colors ${
                    editor.isActive("table")
                        ? "bg-brand-ink text-brand-surface"
                        : "text-brand-ink"
                }`}
                title="Insert Table"
                aria-label="Insert Table"
            >
                <TableIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={onOpenImageDialog}
                className="p-1.5 rounded-brand hover:bg-brand-muted text-brand-ink transition-colors"
                title="Insert Image"
                aria-label="Insert Image"
            >
                <ImageIcon className="w-4 h-4" aria-hidden="true" />
            </button>

            <button
                type="button"
                onClick={() => editor.chain().focus().setHorizontalRule().run()}
                className="p-1.5 rounded-brand hover:bg-brand-muted text-brand-ink transition-colors"
                title="Divider Line"
                aria-label="Divider Line"
            >
                <Minus className="w-4 h-4" aria-hidden="true" />
            </button>

            {/* Quick Link Dialog Popover */}
            {isLinkPromptOpen && (
                <div className="flex items-center gap-1.5 ml-2 p-1 bg-brand-muted border border-brand-ink rounded-brand">
                    <input
                        type="url"
                        placeholder="https://example.com"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                setLink();
                            } else if (e.key === "Escape") {
                                setIsLinkPromptOpen(false);
                            }
                        }}
                        className="px-2 py-1 text-xs bg-brand-surface text-brand-ink rounded-brand font-brand-mono outline-none w-44"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={setLink}
                        className="px-2 py-1 text-xs font-bold font-brand-mono bg-brand-accent text-white rounded-brand hover:opacity-90"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLinkPromptOpen(false)}
                        className="px-1.5 py-1 text-xs text-brand-subtle hover:text-brand-ink"
                    >
                        ✕
                    </button>
                </div>
            )}
        </div>
    );
}
