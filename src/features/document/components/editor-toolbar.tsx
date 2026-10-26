"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import {
    AlignCenter,
    AlignJustify,
    AlignLeft,
    AlignRight,
    Code,
    Code2,
    Highlighter,
    Image as ImageIcon,
    Link as LinkIcon,
    List,
    ListOrdered,
    ListTodo,
    Minus,
    Quote,
    Redo2,
    Table as TableIcon,
    Undo2,
    X,
} from "lucide-react";

import { cn } from "@/lib/cn";

export interface EditorToolbarProps {
    editor: Editor | null;
    onOpenImageDialog: () => void;
    disabled?: boolean;
}

interface ToolbarTool {
    id: string;
    /** Accessible name; every tool is icon-only. */
    label: string;
    /** Hover hint, with the keyboard shortcut where there is one. */
    hint: string;
    icon: ReactNode;
    /** Formats and block types report a pressed state; one-shot actions do not. */
    pressed?: boolean;
    unavailable?: boolean;
    run: () => void;
}

const ICON = "size-4";

const HEADING_LEVELS: Array<1 | 2 | 3 | 4> = [1, 2, 3, 4];

interface GlyphProps {
    children: ReactNode;
    className?: string;
}

/** A letterform drawn as the icon, the way the design sets B, I, U and H1. */
function Glyph({ children, className }: GlyphProps) {
    return (
        <span
            className={cn("text-[0.8125rem] leading-none font-bold", className)}
        >
            {children}
        </span>
    );
}

/**
 * The night pill above the canvas. Active formats are lime fills.
 *
 * WAI-ARIA toolbar pattern: the whole toolbar is one tab stop; arrow keys move
 * between tools, Home and End jump to the ends. In read-only mode every tool
 * stays reachable but announces itself unavailable and does nothing.
 */
export function EditorToolbar({
    editor,
    onOpenImageDialog,
    disabled = false,
}: EditorToolbarProps) {
    const [isLinkPromptOpen, setIsLinkPromptOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState("");
    const [focusIndex, setFocusIndex] = useState(0);
    const buttonRefs = useRef<Array<HTMLButtonElement | null>>([]);

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

    const groups: ToolbarTool[][] = [
        [
            {
                id: "undo",
                label: "Undo",
                hint: "Undo (Mod-Z)",
                icon: <Undo2 className={ICON} />,
                unavailable: !editor.can().undo(),
                run: () => editor.chain().focus().undo().run(),
            },
            {
                id: "redo",
                label: "Redo",
                hint: "Redo (Mod-Shift-Z)",
                icon: <Redo2 className={ICON} />,
                unavailable: !editor.can().redo(),
                run: () => editor.chain().focus().redo().run(),
            },
        ],
        [
            {
                id: "paragraph",
                label: "Paragraph",
                hint: "Paragraph",
                icon: <Glyph className="text-[0.9375rem]">¶</Glyph>,
                pressed: editor.isActive("paragraph"),
                run: () => editor.chain().focus().setParagraph().run(),
            },
            ...HEADING_LEVELS.map((level) => ({
                id: `heading-${level}`,
                label: `Heading ${level}`,
                hint: `Heading ${level} (Mod-Alt-${level})`,
                icon: <Glyph>H{level}</Glyph>,
                pressed: editor.isActive("heading", { level }),
                run: () =>
                    editor.chain().focus().toggleHeading({ level }).run(),
            })),
        ],
        [
            {
                id: "bold",
                label: "Bold",
                hint: "Bold (Mod-B)",
                icon: (
                    <Glyph className="text-[0.9375rem] font-extrabold">B</Glyph>
                ),
                pressed: editor.isActive("bold"),
                run: () => editor.chain().focus().toggleBold().run(),
            },
            {
                id: "italic",
                label: "Italic",
                hint: "Italic (Mod-I)",
                icon: (
                    <Glyph className="paddock-serif text-[1.0625rem] font-normal italic">
                        I
                    </Glyph>
                ),
                pressed: editor.isActive("italic"),
                run: () => editor.chain().focus().toggleItalic().run(),
            },
            {
                id: "underline",
                label: "Underline",
                hint: "Underline (Mod-U)",
                icon: <Glyph className="text-sm underline">U</Glyph>,
                pressed: editor.isActive("underline"),
                run: () => editor.chain().focus().toggleUnderline().run(),
            },
            {
                id: "strike",
                label: "Strikethrough",
                hint: "Strikethrough (Mod-Shift-S)",
                icon: <Glyph className="text-sm line-through">S</Glyph>,
                pressed: editor.isActive("strike"),
                run: () => editor.chain().focus().toggleStrike().run(),
            },
            {
                id: "code",
                label: "Inline code",
                hint: "Inline code (Mod-E)",
                icon: <Code className={ICON} />,
                pressed: editor.isActive("code"),
                run: () => editor.chain().focus().toggleCode().run(),
            },
            {
                id: "highlight",
                label: "Highlight",
                hint: "Highlight (Mod-Shift-H)",
                icon: <Highlighter className={ICON} />,
                pressed: editor.isActive("highlight"),
                run: () => editor.chain().focus().toggleHighlight().run(),
            },
            {
                id: "link",
                label: "Link",
                hint: "Link (Mod-K)",
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
            {
                id: "align-justify",
                label: "Justify",
                hint: "Justify",
                icon: <AlignJustify className={ICON} />,
                pressed: editor.isActive({ textAlign: "justify" }),
                run: () => editor.chain().focus().setTextAlign("justify").run(),
            },
        ],
        [
            {
                id: "bullet-list",
                label: "Bullet list",
                hint: "Bullet list (Mod-Shift-8)",
                icon: <List className={ICON} />,
                pressed: editor.isActive("bulletList"),
                run: () => editor.chain().focus().toggleBulletList().run(),
            },
            {
                id: "ordered-list",
                label: "Numbered list",
                hint: "Numbered list (Mod-Shift-7)",
                icon: <ListOrdered className={ICON} />,
                pressed: editor.isActive("orderedList"),
                run: () => editor.chain().focus().toggleOrderedList().run(),
            },
            {
                id: "task-list",
                label: "Checklist",
                hint: "Checklist (Mod-Shift-9)",
                icon: <ListTodo className={ICON} />,
                pressed: editor.isActive("taskList"),
                run: () => editor.chain().focus().toggleTaskList().run(),
            },
            {
                id: "code-block",
                label: "Code block",
                hint: "Code block (Mod-Alt-C)",
                icon: <Code2 className={ICON} />,
                pressed: editor.isActive("codeBlock"),
                run: () => editor.chain().focus().toggleCodeBlock().run(),
            },
            {
                id: "blockquote",
                label: "Quote",
                hint: "Quote (Mod-Shift-B)",
                icon: <Quote className={ICON} />,
                pressed: editor.isActive("blockquote"),
                run: () => editor.chain().focus().toggleBlockquote().run(),
            },
        ],
        [
            {
                id: "table",
                label: "Insert table",
                hint: "Insert table",
                icon: <TableIcon className={ICON} />,
                pressed: editor.isActive("table"),
                run: () =>
                    editor
                        .chain()
                        .focus()
                        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                        .run(),
            },
            {
                id: "image",
                label: "Insert image",
                hint: "Insert image",
                icon: <ImageIcon className={ICON} />,
                run: onOpenImageDialog,
            },
            {
                id: "divider",
                label: "Divider line",
                hint: "Divider line",
                icon: <Minus className={ICON} />,
                run: () => editor.chain().focus().setHorizontalRule().run(),
            },
        ],
    ];

    const tools = groups.flat();
    const rovingIndex = Math.min(focusIndex, tools.length - 1);

    const moveTo = (index: number) => {
        const wrapped = (index + tools.length) % tools.length;
        setFocusIndex(wrapped);
        buttonRefs.current[wrapped]?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        // Only the tools rove; the link field keeps its own arrow keys.
        const from = buttonRefs.current.findIndex(
            (node) => node !== null && node === event.target,
        );
        if (from === -1) return;

        const targets: Record<string, number> = {
            ArrowRight: from + 1,
            ArrowLeft: from - 1,
            Home: 0,
            End: tools.length - 1,
        };
        const target = targets[event.key];
        if (target === undefined) return;
        event.preventDefault();
        moveTo(target);
    };

    // Where each group starts in the flat order, so every tool knows its index.
    const groupStarts = groups.map((_, groupIndex) =>
        groups
            .slice(0, groupIndex)
            .reduce((total, group) => total + group.length, 0),
    );

    return (
        <div
            role="toolbar"
            aria-label="Editor formatting toolbar"
            aria-disabled={disabled}
            onKeyDown={handleKeyDown}
            className={cn(
                "paddock-night mx-auto flex w-fit max-w-full flex-wrap items-center justify-center gap-y-0.5 rounded-[1.75rem] p-1.5 transition-opacity duration-150",
                disabled && "pointer-events-none opacity-45",
            )}
        >
            {groups.map((group, groupIndex) => (
                <div
                    key={group.map((tool) => tool.id).join("-")}
                    className="flex flex-wrap items-center justify-center"
                >
                    {groupIndex > 0 ? (
                        <span
                            aria-hidden="true"
                            className="mx-0.5 h-5 w-px bg-paddock-night-rule"
                        />
                    ) : null}
                    {group.map((tool, toolIndex) => {
                        const index =
                            (groupStarts[groupIndex] ?? 0) + toolIndex;
                        const isUnavailable = disabled || tool.unavailable;
                        return (
                            <button
                                key={tool.id}
                                ref={(node) => {
                                    buttonRefs.current[index] = node;
                                }}
                                type="button"
                                title={tool.hint}
                                aria-label={tool.label}
                                aria-pressed={tool.pressed}
                                aria-disabled={isUnavailable || undefined}
                                tabIndex={index === rovingIndex ? 0 : -1}
                                onFocus={() => setFocusIndex(index)}
                                onClick={() => {
                                    if (!isUnavailable) tool.run();
                                }}
                                className={cn(
                                    "flex size-11 cursor-pointer items-center justify-center rounded-full transition-colors",
                                    tool.pressed
                                        ? "bg-paddock-lime text-paddock-on-fill"
                                        : "bg-transparent text-paddock-night-fg hover:bg-paddock-night-fg/14",
                                    tool.unavailable &&
                                        "cursor-not-allowed opacity-35 hover:bg-transparent",
                                )}
                            >
                                <span
                                    aria-hidden="true"
                                    className="inline-flex"
                                >
                                    {tool.icon}
                                </span>
                            </button>
                        );
                    })}
                </div>
            ))}

            {isLinkPromptOpen ? (
                <div className="ml-1 flex items-center gap-1">
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
                        Set link
                    </button>
                    <button
                        type="button"
                        aria-label="Cancel link"
                        onClick={() => setIsLinkPromptOpen(false)}
                        className="flex size-11 cursor-pointer items-center justify-center rounded-full text-paddock-night-fg hover:bg-paddock-night-fg/14"
                    >
                        <X className={ICON} aria-hidden="true" />
                    </button>
                </div>
            ) : null}
        </div>
    );
}
