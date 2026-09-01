"use client";

import {
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type FormEvent,
} from "react";
import {
    Image as ImageIcon,
    Link as LinkIcon,
    Loader2,
    Upload,
    X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

import { uploadDocumentImageAction } from "../actions/upload-document-image";

export interface ImageDialogProps {
    open: boolean;
    onClose: () => void;
    onInsert: (data: { src: string; alt?: string }) => void;
    workspaceId?: string;
}

type TabMode = "upload" | "url";

export function ImageDialog({
    open,
    onClose,
    onInsert,
    workspaceId,
}: ImageDialogProps) {
    const [tab, setTab] = useState<TabMode>("upload");
    const [url, setUrl] = useState("");
    const [alt, setAlt] = useState("");
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = () => {
        setUrl("");
        setAlt("");
        setSelectedFile(null);
        setPreviewUrl(null);
        setError(null);
        setIsUploading(false);
        setIsDragging(false);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const validateAndSetFile = (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError(
                "Please select a valid image file (PNG, JPG, WebP, GIF, SVG)",
            );
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setError(null);
        setSelectedFile(file);

        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === "string") {
                setPreviewUrl(result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (file) {
            validateAndSetFile(file);
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);

        if (tab === "upload") {
            if (!selectedFile && !previewUrl) {
                setError("Please select an image file to upload");
                return;
            }

            setIsUploading(true);

            // Attempt server upload if workspaceId and selectedFile exist
            if (workspaceId && selectedFile) {
                try {
                    const formData = new FormData();
                    formData.append("file", selectedFile);
                    formData.append("workspaceId", workspaceId);

                    const res = await uploadDocumentImageAction(formData);
                    if (res.success) {
                        onInsert({
                            src: res.data.url,
                            alt: alt.trim() || selectedFile.name,
                        });
                        handleClose();
                        return;
                    }
                } catch {
                    // Fall back to data URL
                }
            }

            // Fallback to data URL
            if (previewUrl) {
                onInsert({
                    src: previewUrl,
                    alt: alt.trim() || selectedFile?.name || undefined,
                });
                handleClose();
                return;
            }

            setIsUploading(false);
            setError("Failed to process image. Please try again.");
        } else {
            // URL Mode
            if (!url || url.trim().length === 0) {
                setError("Please provide an image URL");
                return;
            }

            onInsert({
                src: url.trim(),
                alt: alt.trim() || undefined,
            });
            handleClose();
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} title="Insert Image">
            {/* Tabs */}
            <div className="flex border-b-2 border-brand-ink mb-4">
                <button
                    type="button"
                    onClick={() => {
                        setTab("upload");
                        setError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-brand-mono uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
                        tab === "upload"
                            ? "border-brand-ink font-bold text-brand-ink bg-brand-muted"
                            : "border-transparent text-brand-subtle hover:text-brand-ink"
                    }`}
                >
                    <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                    Upload File
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setTab("url");
                        setError(null);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-brand-mono uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
                        tab === "url"
                            ? "border-brand-ink font-bold text-brand-ink bg-brand-muted"
                            : "border-transparent text-brand-subtle hover:text-brand-ink"
                    }`}
                >
                    <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                    Image URL
                </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {tab === "upload" ? (
                    <div className="flex flex-col gap-3">
                        {!previewUrl ? (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-brand cursor-pointer transition-colors ${
                                    isDragging
                                        ? "border-brand-accent bg-brand-muted"
                                        : "border-brand-border hover:border-brand-ink bg-brand-muted/50 hover:bg-brand-muted"
                                }`}
                            >
                                <div className="p-3 bg-brand-surface border border-brand-border rounded-brand mb-2">
                                    <Upload
                                        className="w-6 h-6 text-brand-ink"
                                        aria-hidden="true"
                                    />
                                </div>
                                <span className="text-xs font-bold font-brand-mono uppercase tracking-wider text-brand-ink">
                                    Choose an image or drag & drop
                                </span>
                                <span className="text-[11px] font-brand-mono text-brand-subtle mt-1">
                                    PNG, JPG, WebP, GIF, SVG (up to 5MB)
                                </span>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                    onChange={handleFileChange}
                                    className="sr-only"
                                />
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="relative border-2 border-brand-ink rounded-brand overflow-hidden bg-brand-muted p-2 flex items-center justify-center min-h-[140px] max-h-[220px]">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewUrl}
                                        alt="Selected Preview"
                                        className="max-h-[200px] max-w-full object-contain rounded-brand shadow-brand-subtle"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setPreviewUrl(null);
                                            if (fileInputRef.current) {
                                                fileInputRef.current.value = "";
                                            }
                                        }}
                                        className="absolute top-2 right-2 p-1 bg-brand-ink text-brand-surface rounded-brand hover:opacity-80 transition-opacity"
                                        title="Remove selected image"
                                        aria-label="Remove selected image"
                                    >
                                        <X
                                            className="w-3.5 h-3.5"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                {selectedFile && (
                                    <div className="flex items-center justify-between text-xs font-brand-mono text-brand-subtle px-1">
                                        <span className="truncate max-w-[240px]">
                                            {selectedFile.name}
                                        </span>
                                        <span>
                                            {(selectedFile.size / 1024).toFixed(
                                                1,
                                            )}{" "}
                                            KB
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <FormField
                        label="Image Web URL"
                        htmlFor="image-dialog-url"
                        error={error ?? undefined}
                    >
                        <Input
                            id="image-dialog-url"
                            type="text"
                            placeholder="https://example.com/image.png"
                            value={url}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setError(null);
                            }}
                        />
                    </FormField>
                )}

                {error && tab === "upload" && (
                    <p
                        className="text-xs font-brand-mono text-brand-danger"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                <FormField
                    label="Alt Text (Accessibility & SEO)"
                    htmlFor="image-dialog-alt"
                >
                    <Input
                        id="image-dialog-alt"
                        type="text"
                        placeholder="Description of the image"
                        value={alt}
                        onChange={(e) => setAlt(e.target.value)}
                    />
                </FormField>

                <div className="flex justify-end gap-3 mt-2">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="primary"
                        disabled={
                            isUploading ||
                            (tab === "upload" && !previewUrl) ||
                            (tab === "url" && !url.trim())
                        }
                    >
                        {isUploading ? (
                            <>
                                <Loader2
                                    className="w-4 h-4 mr-1.5 animate-spin"
                                    aria-hidden="true"
                                />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <ImageIcon
                                    className="w-4 h-4 mr-1.5"
                                    aria-hidden="true"
                                />
                                Insert Image
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
