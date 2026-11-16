"use client";

import { useEffect, useMemo, useState } from "react";
import CharacterCount from "@tiptap/extension-character-count";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { PAGE_CONTAINER } from "@/components/layout/layout-styles";
import { BackLink } from "@/components/paddock/back-link";
import { ContourBackground } from "@/components/paddock/contour-background";
import { PaddockAvatar } from "@/components/paddock/paddock-avatar";
import { PaddockButton } from "@/components/paddock/paddock-button";
import { Tag } from "@/components/paddock/tag";
import { cn } from "@/lib/cn";
import { getUserColor } from "@/lib/presence";

import { useDocumentCollab } from "../hooks/use-document-collab";
import { lowlight } from "../lib/syntax-highlighter";
import type { DocumentDetail } from "../types";
import { EditorBubbleMenu } from "./bubble-menu";
import {
    renderCollaborationCursor,
    renderCollaborationSelection,
} from "./collaboration-cursor-render";
import { DocumentStats } from "./document-stats";
import { DocumentTitle } from "./document-title";
import { EditorToolbar } from "./editor-toolbar";
import { ImageDialog } from "./image-dialog";
import { PresenceBar } from "./presence-bar";
import { ReadOnlyBanner } from "./read-only-banner";
import { SaveStatusIndicator } from "./save-status-indicator";
import { createSlashCommandExtension } from "./slash-menu/slash-command";
import { TableControls } from "./table-controls";

export interface CollaborativeEditorProps {
    document: DocumentDetail;
    currentUser: {
        id: string;
        name: string;
        image?: string | null;
    };
    workspaceId: string;
}

export function CollaborativeEditor({
    document,
    currentUser,
    workspaceId,
}: CollaborativeEditorProps) {
    const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);

    const {
        ydoc,
        provider,
        saveState,
        lastSavedAt,
        collaborators,
        connectionStatus,
        title,
        setTitle,
        saveNow,
        isReadOnly,
        readOnlyReason,
        takeOverEditing,
    } = useDocumentCollab({
        documentId: document.id,
        workspaceId,
        initialTitle: document.title,
        initialContentBase64: document.contentBase64,
        currentUser,
    });

    const userColor = useMemo(
        () => getUserColor(currentUser.id),
        [currentUser.id],
    );

    const extensions = useMemo(() => {
        const list = [
            StarterKit.configure({
                history: false, // CRDT y-collaboration manages undo/redo
                codeBlock: false, // Handled by code-block-lowlight
            }),
            Collaboration.configure({
                document: ydoc,
            }),
            Underline,
            Highlight.configure({ multicolor: true }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    rel: "noopener noreferrer nofollow",
                },
            }),
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            Placeholder.configure({
                placeholder: "Type '/' for commands or start typing...",
            }),
            CharacterCount.configure({
                limit: 100000,
            }),
            CodeBlockLowlight.extend({
                addKeyboardShortcuts() {
                    return {
                        ...this.parent?.(),
                        "Mod-a": ({ editor }) => {
                            const { state } = editor;
                            const { $from } = state.selection;
                            if ($from.parent.type.name === "codeBlock") {
                                const start = $from.start();
                                const end = $from.end();
                                // If already fully selected, let the default select-all happen
                                if (
                                    state.selection.from === start &&
                                    state.selection.to === end
                                ) {
                                    import("sonner").then(({ toast }) => {
                                        toast("Entire document selected", {
                                            duration: 2000,
                                        });
                                    });
                                    return false;
                                }

                                const result = editor.commands.setTextSelection(
                                    { from: start, to: end },
                                );
                                import("sonner").then(({ toast }) => {
                                    toast("Code block selected", {
                                        description:
                                            "Press Ctrl+A again to select the entire document.",
                                        duration: 2500,
                                    });
                                });
                                return result;
                            }
                            return false;
                        },
                    };
                },
            }).configure({
                lowlight,
                HTMLAttributes: {
                    spellcheck: "false",
                },
            }),
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            TaskList,
            TaskItem.configure({
                nested: true,
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            createSlashCommandExtension(() => setIsImageDialogOpen(true)),
        ];

        if (provider) {
            list.push(
                CollaborationCursor.configure({
                    provider,
                    user: {
                        id: currentUser.id,
                        name: currentUser.name,
                        color: userColor,
                        avatarUrl: currentUser.image ?? null,
                    },
                    render: renderCollaborationCursor,
                    selectionRender: renderCollaborationSelection,
                }),
            );
        }

        return list;
    }, [
        ydoc,
        provider,
        currentUser.id,
        currentUser.name,
        currentUser.image,
        userColor,
    ]);

    const editor = useEditor(
        {
            extensions,
            immediatelyRender: false,
            // Each keystroke, selection change and remote cursor move is a
            // transaction. Re-rendering this whole tree for each one is what
            // made typing heavy; the toolbar, bubble menu and counts each
            // subscribe to the slice they show instead.
            shouldRerenderOnTransaction: false,
            editable: !isReadOnly,
            editorProps: {
                attributes: {
                    class: "min-h-[500px] max-w-none px-5 pt-14 pb-12 text-paddock-ink sm:px-16 sm:pt-16 sm:pb-14",
                },
            },
        },
        [ydoc, provider],
    );

    // Keep editor editable state in sync when multi-session lock changes
    useEffect(() => {
        if (editor && !editor.isDestroyed) {
            editor.setEditable(!isReadOnly);
        }
    }, [editor, isReadOnly]);

    const isInTable =
        useEditorState({
            editor,
            selector: ({ editor: current }) =>
                current?.isActive("table") ?? false,
        }) ?? false;

    return (
        <div className="w-full min-w-0">
            {/* Title row: back, the title itself, who is here, save state */}
            <section
                className={cn(
                    PAGE_CONTAINER,
                    "flex flex-wrap items-center gap-x-[1.125rem] gap-y-3.5 pt-7 pb-2",
                )}
            >
                <BackLink
                    href={`/${workspaceId}/documents`}
                    label="Documents"
                    aria-label="Back to documents"
                />

                <div className="min-w-0 flex-[1_1_20rem]">
                    <DocumentTitle
                        initialTitle={title}
                        onTitleChange={setTitle}
                        disabled={isReadOnly}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-x-[1.125rem] gap-y-3">
                    <PresenceBar
                        users={collaborators}
                        currentUserId={currentUser.id}
                        connectionStatus={connectionStatus}
                        isReadOnly={isReadOnly}
                    />

                    <SaveStatusIndicator
                        saveState={saveState}
                        lastSavedAt={lastSavedAt}
                        onSaveNow={saveNow}
                        isReadOnly={isReadOnly}
                    />

                    <PaddockButton
                        variant="outline"
                        size="sm"
                        onClick={saveNow}
                        disabled={isReadOnly || saveState === "saving"}
                        className="hidden sm:inline-flex"
                    >
                        Save
                    </PaddockButton>
                </div>
            </section>

            {/* Read-Only Multi-Session Notification Banner */}
            {isReadOnly && (
                <div className={cn(PAGE_CONTAINER, "mt-3")}>
                    <ReadOnlyBanner
                        reason={readOnlyReason}
                        onTakeOverEditing={takeOverEditing}
                    />
                </div>
            )}

            <div className={cn(PAGE_CONTAINER, "relative pt-7 pb-24")}>
                <ContourBackground pattern="band" />

                {/* The toolbar floats over the top edge of the canvas and
                    sticks below the site header (81px) while you scroll. */}
                <div className="sticky top-[5.5625rem] z-20 -mb-6 flex flex-col items-center gap-2">
                    <EditorToolbar
                        editor={editor}
                        onOpenImageDialog={() => setIsImageDialogOpen(true)}
                        disabled={isReadOnly}
                    />

                    {/* Contextual Table Controls */}
                    {!isReadOnly && isInTable && (
                        <div className="max-w-full overflow-x-auto">
                            <TableControls editor={editor} />
                        </div>
                    )}
                </div>

                <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,51.25rem)_minmax(0,1fr)]">
                    <article className="min-w-0 xl:col-start-2">
                        {/* Editor Surface Container */}
                        <div className="relative max-w-full overflow-hidden rounded-paddock-card border border-paddock-rule bg-paddock-sheet transition-colors duration-150 focus-within:border-paddock-ink">
                            {editor && (
                                <EditorBubbleMenu
                                    editor={editor}
                                    isReadOnly={isReadOnly}
                                />
                            )}
                            <div className="w-full overflow-x-auto">
                                <EditorContent editor={editor} />
                            </div>
                        </div>

                        {/* Editor Footer Status */}
                        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1.5 pt-3.5 text-[0.8125rem] text-paddock-subtle">
                            <span>
                                {isReadOnly
                                    ? "Read-only mode (spectating live changes)"
                                    : "Markdown shortcuts and slash commands work here"}
                            </span>
                            <DocumentStats editor={editor} />
                        </div>
                    </article>

                    {/* Who is in the document, named, beside the page */}
                    {collaborators.length > 0 && (
                        <aside
                            aria-labelledby="editor-people-heading"
                            className="hidden xl:col-start-3 xl:mt-[4.375rem] xl:flex xl:flex-col xl:items-end xl:gap-2"
                        >
                            <Tag as="h2" tone="ink" className="m-0">
                                <span id="editor-people-heading">
                                    In this doc
                                </span>
                            </Tag>
                            <ul className="m-0 flex list-none flex-col items-end gap-2 p-0">
                                {collaborators.map((user) => (
                                    <li
                                        key={user.id}
                                        className="flex items-center gap-2.5"
                                    >
                                        <span className="text-[0.8125rem] font-semibold">
                                            {user.id === currentUser.id
                                                ? "You"
                                                : user.name}
                                        </span>
                                        <PaddockAvatar
                                            person={{
                                                id: user.id,
                                                name: user.name,
                                                image: user.avatarUrl,
                                            }}
                                            size="lg"
                                            decorative
                                        />
                                    </li>
                                ))}
                            </ul>
                        </aside>
                    )}
                </div>
            </div>

            {/* Image Insertion Dialog */}
            <ImageDialog
                open={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                workspaceId={workspaceId}
                onInsert={(data) => {
                    if (editor && !isReadOnly) {
                        editor
                            .chain()
                            .focus()
                            .setImage({ src: data.src, alt: data.alt })
                            .run();
                    }
                }}
            />
        </div>
    );
}
