"use client";

import { useMemo, useState } from "react";
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
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Save } from "lucide-react";
import LinkNext from "next/link";

import { Button } from "@/components/ui/button";
import { lowlight } from "../lib/syntax-highlighter";
import { getUserColor } from "../lib/user-colors";
import { useDocumentCollab } from "../hooks/use-document-collab";
import type { DocumentDetail } from "../types";
import { EditorBubbleMenu } from "./bubble-menu";
import { DocumentTitle } from "./document-title";
import { EditorToolbar } from "./editor-toolbar";
import { ImageDialog } from "./image-dialog";
import { PresenceBar } from "./presence-bar";
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
            CodeBlockLowlight.configure({
                lowlight,
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
                        name: currentUser.name,
                        color: userColor,
                    },
                }),
            );
        }

        return list;
    }, [ydoc, provider, currentUser.name, userColor]);

    const editor = useEditor(
        {
            extensions,
            immediatelyRender: false,
            editorProps: {
                attributes: {
                    class: "prose max-w-none focus:outline-none min-h-[500px] px-6 py-6 font-brand-sans text-brand-ink",
                },
            },
        },
        [ydoc, provider],
    );

    const wordCount = editor?.storage.characterCount?.words() ?? 0;
    const charCount = editor?.storage.characterCount?.characters() ?? 0;

    return (
        <div className="flex flex-col gap-4 max-w-5xl mx-auto px-4 sm:px-6 py-6 w-full min-w-0">
            {/* Navigation & Status Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b-2 border-brand-border w-full min-w-0">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <LinkNext
                        href={`/${workspaceId}/documents`}
                        className="flex items-center justify-center p-2 text-brand-subtle hover:text-brand-ink bg-brand-surface hover:bg-brand-muted border-2 border-brand-ink rounded-brand shadow-brand-subtle transition-all duration-150 shrink-0"
                        title="Back to Documents"
                        aria-label="Back to Documents"
                    >
                        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                    </LinkNext>

                    <div className="min-w-0 flex-1">
                        <DocumentTitle
                            initialTitle={title}
                            onTitleChange={setTitle}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                    <PresenceBar
                        users={collaborators}
                        currentUserId={currentUser.id}
                        connectionStatus={connectionStatus}
                    />

                    <SaveStatusIndicator
                        saveState={saveState}
                        lastSavedAt={lastSavedAt}
                        onSaveNow={saveNow}
                    />

                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={saveNow}
                        disabled={saveState === "saving"}
                        className="hidden sm:inline-flex"
                    >
                        <Save className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                        Save
                    </Button>
                </div>
            </div>

            {/* Editor Toolbar */}
            <div className="sticky top-2 z-20 max-w-full">
                <EditorToolbar
                    editor={editor}
                    onOpenImageDialog={() => setIsImageDialogOpen(true)}
                />
            </div>

            {/* Contextual Table Controls */}
            <div className="max-w-full overflow-x-auto">
                <TableControls editor={editor} />
            </div>

            {/* Editor Surface Container */}
            <div className="relative min-h-[550px] bg-brand-surface border-2 border-brand-ink rounded-brand shadow-brand-card focus-within:border-brand-accent transition-colors duration-150 max-w-full overflow-hidden">
                {editor && <EditorBubbleMenu editor={editor} />}
                <div className="overflow-x-auto w-full">
                    <EditorContent editor={editor} />
                </div>
            </div>

            {/* Editor Footer Status */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-brand-mono uppercase tracking-wider text-brand-subtle px-2 py-1">
                <span>Markdown shortcuts & slash commands enabled</span>
                <div className="flex items-center gap-4">
                    <span>{wordCount} words</span>
                    <span>{charCount} characters</span>
                </div>
            </div>

            {/* Image Insertion Dialog */}
            <ImageDialog
                open={isImageDialogOpen}
                onClose={() => setIsImageDialogOpen(false)}
                onInsert={(data) => {
                    if (editor) {
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
