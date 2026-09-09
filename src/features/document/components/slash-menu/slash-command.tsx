import React from "react";
import { Extension, type Editor, type Range } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import {
    Code2,
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    Image as ImageIcon,
    List,
    ListOrdered,
    ListTodo,
    Minus,
    Quote,
    Table as TableIcon,
    Type,
} from "lucide-react";

import {
    SlashMenuList,
    type CommandItem,
    type SlashMenuListRef,
} from "./slash-menu-list";

export const getSuggestionItems = ({
    query,
}: {
    query: string;
}): CommandItem[] => {
    const items: CommandItem[] = [
        {
            title: "Text",
            description: "Plain paragraph text",
            icon: <Type className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor.chain().focus().deleteRange(range).setParagraph().run();
            },
        },
        {
            title: "Heading 1",
            description: "Large top-level section heading",
            icon: <Heading1 className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 1 })
                    .run();
            },
        },
        {
            title: "Heading 2",
            description: "Medium section heading",
            icon: <Heading2 className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 2 })
                    .run();
            },
        },
        {
            title: "Heading 3",
            description: "Small sub-section heading",
            icon: <Heading3 className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 3 })
                    .run();
            },
        },
        {
            title: "Heading 4",
            description: "Minor sub-heading",
            icon: <Heading4 className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setNode("heading", { level: 4 })
                    .run();
            },
        },
        {
            title: "Bullet List",
            description: "Unordered bullet point list",
            icon: <List className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleBulletList()
                    .run();
            },
        },
        {
            title: "Numbered List",
            description: "Ordered sequential list",
            icon: <ListOrdered className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleOrderedList()
                    .run();
            },
        },
        {
            title: "Checklist",
            description: "Task list with toggleable checkboxes",
            icon: <ListTodo className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleTaskList()
                    .run();
            },
        },
        {
            title: "Code Block",
            description: "Code snippet with syntax highlighting",
            icon: <Code2 className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleCodeBlock()
                    .run();
            },
        },
        {
            title: "Quote",
            description: "Blockquote callout",
            icon: <Quote className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .toggleBlockquote()
                    .run();
            },
        },
        {
            title: "Table",
            description: "Insert a 3x3 table with headers",
            icon: <TableIcon className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                    .run();
            },
        },
        {
            title: "Divider",
            description: "Visual horizontal divider line",
            icon: <Minus className="w-4 h-4" aria-hidden="true" />,
            command: ({ editor, range }) => {
                editor
                    .chain()
                    .focus()
                    .deleteRange(range)
                    .setHorizontalRule()
                    .run();
            },
        },
    ];

    if (!query) {
        return items;
    }

    const cleanQuery = query.toLowerCase().trim();
    return items.filter(
        (item) =>
            item.title.toLowerCase().includes(cleanQuery) ||
            item.description.toLowerCase().includes(cleanQuery),
    );
};

export const createSlashCommandExtension = (onOpenImageDialog?: () => void) => {
    return Extension.create({
        name: "slashCommand",

        addOptions() {
            return {
                suggestion: {
                    char: "/",
                    command: ({
                        editor,
                        range,
                        props,
                    }: {
                        editor: Editor;
                        range: Range;
                        props: CommandItem;
                    }) => {
                        props.command({ editor, range });
                    },
                } as Partial<SuggestionOptions<CommandItem>>,
            };
        },

        addProseMirrorPlugins() {
            return [
                Suggestion<CommandItem>({
                    editor: this.editor,
                    ...this.options.suggestion,
                    items: ({ query }) => {
                        const items = getSuggestionItems({ query });
                        if (onOpenImageDialog) {
                            items.push({
                                title: "Image",
                                description: "Upload or embed image via URL",
                                icon: (
                                    <ImageIcon
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                    />
                                ),
                                command: ({ editor, range }) => {
                                    editor
                                        .chain()
                                        .focus()
                                        .deleteRange(range)
                                        .run();
                                    onOpenImageDialog();
                                },
                            });
                        }
                        return items;
                    },
                    render: () => {
                        let component: ReactRenderer<SlashMenuListRef> | null =
                            null;
                        let popupElement: HTMLDivElement | null = null;

                        return {
                            onStart: (props) => {
                                component = new ReactRenderer(SlashMenuList, {
                                    props,
                                    editor: props.editor,
                                });

                                popupElement = document.createElement("div");
                                popupElement.style.position = "absolute";
                                popupElement.style.zIndex = "9999";
                                popupElement.appendChild(component.element);
                                document.body.appendChild(popupElement);

                                const rect = props.clientRect?.();
                                if (rect && popupElement) {
                                    popupElement.style.left = `${rect.left + window.scrollX}px`;
                                    popupElement.style.top = `${rect.bottom + window.scrollY + 5}px`;
                                }
                            },

                            onUpdate: (props) => {
                                component?.updateProps(props);
                                const rect = props.clientRect?.();
                                if (rect && popupElement) {
                                    popupElement.style.left = `${rect.left + window.scrollX}px`;
                                    popupElement.style.top = `${rect.bottom + window.scrollY + 5}px`;
                                }
                            },

                            onKeyDown: (props) => {
                                if (props.event.key === "Escape") {
                                    return true;
                                }
                                return (
                                    component?.ref?.onKeyDown(props) ?? false
                                );
                            },

                            onExit: () => {
                                try {
                                    component?.destroy();
                                } catch (err) {
                                    console.warn(
                                        "[SlashCommand] Error destroying component:",
                                        err,
                                    );
                                }
                                if (popupElement && popupElement.parentNode) {
                                    popupElement.parentNode.removeChild(
                                        popupElement,
                                    );
                                }
                                component = null;
                                popupElement = null;
                            },
                        };
                    },
                }),
            ];
        },
    });
};
