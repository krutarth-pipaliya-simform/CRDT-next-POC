"use client";

import { useState } from "react";
import { BubbleMenu as TipTapBubbleMenu, type Editor } from "@tiptap/react";
import {
    AlignCenter,
    AlignLeft,
    AlignRight,
    Bold,
    Code,
    Highlighter,
    Italic,
    Link as LinkIcon,
    Strikethrough,
    Underline,
} from "lucide-react";

export interface EditorBubbleMenuProps {
    editor: Editor | null;
}

export function EditorBubbleMenu({ editor }: EditorBubbleMenuProps) {
    const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");

    if (!editor) {
        return null;
    }

    const setLink = () => {
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
        <TipTapBubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: "top" }}
            className="flex items-center gap-0.5 p-1 bg-brand-ink text-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-card z-40"
        >
            {isLinkPromptOpen ? (
                <div className="flex items-center gap-1 p-1">
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
                        Set
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsLinkPromptOpen(false)}
                        className="px-1.5 py-1 text-xs text-brand-surface/70 hover:text-brand-surface"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <>
                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().toggleBold().run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("bold")
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Bold (Mod-B)"
                        aria-label="Bold"
                    >
                        <Bold className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().toggleItalic().run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("italic")
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Italic (Mod-I)"
                        aria-label="Italic"
                    >
                        <Italic className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().toggleUnderline().run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("underline")
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Underline (Mod-U)"
                        aria-label="Underline"
                    >
                        <Underline className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().toggleStrike().run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("strike")
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Strikethrough"
                        aria-label="Strikethrough"
                    >
                        <Strikethrough
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().toggleCode().run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("code")
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Inline Code"
                        aria-label="Inline Code"
                    >
                        <Code className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().toggleHighlight().run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("highlight")
                                ? "bg-brand-accent text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Highlight"
                        aria-label="Highlight"
                    >
                        <Highlighter
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            const previousUrl =
                                editor.getAttributes("link").href;
                            setLinkUrl(previousUrl || "");
                            setIsLinkPromptOpen(true);
                        }}
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive("link")
                                ? "bg-brand-accent text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Link"
                        aria-label="Link"
                    >
                        <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <div
                        className="w-[1px] h-4 bg-brand-surface/20 mx-1"
                        aria-hidden="true"
                    />

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().setTextAlign("left").run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive({ textAlign: "left" })
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Align Left"
                        aria-label="Align Left"
                    >
                        <AlignLeft className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().setTextAlign("center").run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive({ textAlign: "center" })
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Align Center"
                        aria-label="Align Center"
                    >
                        <AlignCenter
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            editor.chain().focus().setTextAlign("right").run()
                        }
                        className={`p-1.5 rounded-brand hover:bg-brand-surface/20 transition-colors ${
                            editor.isActive({ textAlign: "right" })
                                ? "bg-brand-surface/30 text-white"
                                : "text-brand-surface/80"
                        }`}
                        title="Align Right"
                        aria-label="Align Right"
                    >
                        <AlignRight
                            className="w-3.5 h-3.5"
                            aria-hidden="true"
                        />
                    </button>
                </>
            )}
        </TipTapBubbleMenu>
    );
}
