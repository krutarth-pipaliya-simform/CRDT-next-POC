"use client";

import { useState, type ReactNode } from "react";
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
    X,
} from "lucide-react";

import { cn } from "@/lib/cn";

export interface EditorBubbleMenuProps {
    editor: Editor | null;
    isReadOnly?: boolean;
}

interface BubbleTool {
    id: string;
    label: string;
    hint: string;
    icon: ReactNode;
    pressed: boolean;
    run: () => void;
}

const ICON = "size-3.5";

const TOOL_CLASSES =
    "flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors";

/** The selection menu: the same night pill as the toolbar, in miniature. */
export function EditorBubbleMenu({
    editor,
    isReadOnly = false,
}: EditorBubbleMenuProps) {
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

    const groups: BubbleTool[][] = [
        [
            {
                id: "bold",
                label: "Bold",
                hint: "Bold (Mod-B)",
                icon: <Bold className={ICON} />,
                pressed: editor.isActive("bold"),
                run: () => editor.chain().focus().toggleBold().run(),
            },
            {
                id: "italic",
                label: "Italic",
                hint: "Italic (Mod-I)",
                icon: <Italic className={ICON} />,
                pressed: editor.isActive("italic"),
                run: () => editor.chain().focus().toggleItalic().run(),
            },
            {
                id: "underline",
                label: "Underline",
                hint: "Underline (Mod-U)",
                icon: <Underline className={ICON} />,
                pressed: editor.isActive("underline"),
                run: () => editor.chain().focus().toggleUnderline().run(),
            },
            {
                id: "strike",
                label: "Strikethrough",
                hint: "Strikethrough",
                icon: <Strikethrough className={ICON} />,
                pressed: editor.isActive("strike"),
                run: () => editor.chain().focus().toggleStrike().run(),
            },
            {
                id: "code",
                label: "Inline code",
                hint: "Inline code",
                icon: <Code className={ICON} />,
                pressed: editor.isActive("code"),
                run: () => editor.chain().focus().toggleCode().run(),
            },
            {
                id: "highlight",
                label: "Highlight",
                hint: "Highlight",
                icon: <Highlighter className={ICON} />,
                pressed: editor.isActive("highlight"),
                run: () => editor.chain().focus().toggleHighlight().run(),
            },
            {
                id: "link",
                label: "Link",
                hint: "Link",
                icon: <LinkIcon className={ICON} />,
                pressed: editor.isActive("link"),
                run: () => {
                    const previousUrl = editor.getAttributes("link").href;
                    setLinkUrl(previousUrl || "");
                    setIsLinkPromptOpen(true);
                },
            },
        ],
        [
            {
                id: "align-left",
                label: "Align left",
                hint: "Align left",
                icon: <AlignLeft className={ICON} />,
                pressed: editor.isActive({ textAlign: "left" }),
                run: () => editor.chain().focus().setTextAlign("left").run(),
            },
            {
                id: "align-center",
                label: "Align centre",
                hint: "Align centre",
                icon: <AlignCenter className={ICON} />,
                pressed: editor.isActive({ textAlign: "center" }),
                run: () => editor.chain().focus().setTextAlign("center").run(),
            },
            {
                id: "align-right",
                label: "Align right",
                hint: "Align right",
                icon: <AlignRight className={ICON} />,
                pressed: editor.isActive({ textAlign: "right" }),
                run: () => editor.chain().focus().setTextAlign("right").run(),
            },
        ],
    ];

    return (
        <TipTapBubbleMenu
            editor={editor}
            tippyOptions={{ duration: 100, placement: "top" }}
            shouldShow={({ editor }) => {
                if (isReadOnly) return false;
                return !editor.view.state.selection.empty && editor.isEditable;
            }}
            className="paddock-night z-40 flex max-w-[calc(100vw-2rem)] flex-wrap items-center rounded-[1.75rem] p-1 shadow-paddock-float"
        >
            {isLinkPromptOpen ? (
                <div className="flex items-center gap-1">
                    <input
                        type="url"
                        aria-label="Link address"
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
                        className="h-11 w-48 rounded-full bg-paddock-night-fg/10 px-4 text-sm text-paddock-night-fg placeholder:text-paddock-night-subtle"
                        autoFocus
                    />
                    <button
                        type="button"
                        onClick={setLink}
                        className="paddock-press h-11 cursor-pointer rounded-full bg-paddock-lime px-4 text-sm font-semibold text-paddock-on-fill"
                    >
                        Set
                    </button>
                    <button
                        type="button"
                        aria-label="Cancel link"
                        onClick={() => setIsLinkPromptOpen(false)}
                        className={cn(
                            TOOL_CLASSES,
                            "text-paddock-night-fg hover:bg-paddock-night-fg/14",
                        )}
                    >
                        <X className={ICON} aria-hidden="true" />
                    </button>
                </div>
            ) : (
                groups.map((group, groupIndex) => (
                    <div
                        key={group.map((tool) => tool.id).join("-")}
                        className="flex items-center"
                    >
                        {groupIndex > 0 ? (
                            <span
                                aria-hidden="true"
                                className="mx-0.5 h-4 w-px bg-paddock-night-rule"
                            />
                        ) : null}
                        {group.map((tool) => (
                            <button
                                key={tool.id}
                                type="button"
                                title={tool.hint}
                                aria-label={tool.label}
                                aria-pressed={tool.pressed}
                                onClick={tool.run}
                                className={cn(
                                    TOOL_CLASSES,
                                    tool.pressed
                                        ? "bg-paddock-lime text-paddock-on-fill"
                                        : "text-paddock-night-fg hover:bg-paddock-night-fg/14",
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className="inline-flex"
                                >
                                    {tool.icon}
                                </span>
                            </button>
                        ))}
                    </div>
                ))
            )}
        </TipTapBubbleMenu>
    );
}
