"use client";

import {
    useId,
    useRef,
    useState,
    type ChangeEvent,
    type DragEvent,
    type FormEvent,
} from "react";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { PaddockDialog } from "@/components/paddock/paddock-dialog";
import { PaddockInput } from "@/components/paddock/paddock-field";
import { PillTabs, pillTabIds } from "@/components/paddock/pill-tabs";
import { cn } from "@/lib/cn";

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
    // The actions sit in the dialog footer, outside the <form>.
    const formId = useId();
    const { tabId, panelId } = pillTabIds("image-dialog", tab);

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

    const handleDragOver = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDrop = (e: DragEvent<HTMLButtonElement>) => {
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

    const isSubmitDisabled =
        isUploading ||
        (tab === "upload" && !previewUrl) ||
        (tab === "url" && !url.trim());

    return (
        <PaddockDialog
            open={open}
            onClose={handleClose}
            titleSerif="Insert"
            titleHeavy="image"
            footer={
                <>
                    <PaddockButton
                        variant="outline"
                        voice="plain"
                        onClick={handleClose}
                        disabled={isUploading}
                    >
                        Cancel
                    </PaddockButton>
                    <PaddockButton
                        type="submit"
                        form={formId}
                        disabled={isSubmitDisabled}
                    >
                        {isUploading ? (
                            <>
                                <Loader2
                                    className="size-4 animate-spin"
                                    aria-hidden="true"
                                />
                                Uploading…
                            </>
                        ) : (
                            <>
                                <ImageIcon
                                    className="size-4"
                                    aria-hidden="true"
                                />
                                Insert image
                            </>
                        )}
                    </PaddockButton>
                </>
            }
        >
            <PillTabs<TabMode>
                items={[
                    { value: "upload", label: "Upload file" },
                    { value: "url", label: "Image URL" },
                ]}
                value={tab}
                onChange={(value) => {
                    setTab(value);
                    setError(null);
                }}
                label="Image source"
                idBase="image-dialog"
                className="mb-5"
            />

            <form
                id={formId}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
            >
                <div
                    role="tabpanel"
                    id={panelId}
                    aria-labelledby={tabId}
                    className="flex flex-col gap-3"
                >
                    {tab === "upload" ? (
                        !previewUrl ? (
                            <>
                                <button
                                    type="button"
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() =>
                                        fileInputRef.current?.click()
                                    }
                                    className={cn(
                                        "flex w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-paddock-card border-[1.5px] border-dashed px-6 py-8 text-center transition-colors",
                                        isDragging
                                            ? "border-paddock-ink bg-paddock-ink/8"
                                            : "border-paddock-ink/40 bg-paddock-sheet hover:border-paddock-ink",
                                    )}
                                >
                                    <span
                                        aria-hidden="true"
                                        className="mb-2 flex size-12 items-center justify-center rounded-paddock bg-paddock-lime text-paddock-on-fill"
                                    >
                                        <Upload className="size-5" />
                                    </span>
                                    <span className="text-[0.9375rem] font-bold text-paddock-ink">
                                        Choose an image or drag &amp; drop
                                    </span>
                                    <span className="paddock-mono text-xs text-paddock-subtle">
                                        PNG, JPG, WebP, GIF, SVG (up to 5MB)
                                    </span>
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
                                    onChange={handleFileChange}
                                    tabIndex={-1}
                                    aria-hidden="true"
                                    className="sr-only"
                                />
                            </>
                        ) : (
                            <div className="flex flex-col gap-2">
                                <div className="relative flex max-h-[220px] min-h-[140px] items-center justify-center overflow-hidden rounded-paddock-card border border-paddock-rule bg-paddock-sheet p-2">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={previewUrl}
                                        alt="Selected Preview"
                                        className="max-h-[200px] max-w-full rounded-paddock object-contain"
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
                                        className="paddock-press absolute top-2 right-2 flex size-11 cursor-pointer items-center justify-center rounded-paddock bg-paddock-inverse text-paddock-on-inverse"
                                        title="Remove selected image"
                                        aria-label="Remove selected image"
                                    >
                                        <X
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                                {selectedFile && (
                                    <div className="paddock-mono flex items-center justify-between gap-3 px-1 text-xs text-paddock-subtle">
                                        <span className="truncate">
                                            {selectedFile.name}
                                        </span>
                                        <span className="shrink-0">
                                            {(selectedFile.size / 1024).toFixed(
                                                1,
                                            )}{" "}
                                            KB
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    ) : (
                        <PaddockInput
                            id="image-dialog-url"
                            label="Image URL"
                            placeholder="https://example.com/image.png"
                            value={url}
                            error={error ?? undefined}
                            onChange={(e) => {
                                setUrl(e.target.value);
                                setError(null);
                            }}
                        />
                    )}

                    {error && tab === "upload" && (
                        <p
                            className="m-0 text-[0.8125rem] font-semibold text-paddock-danger"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}
                </div>

                <PaddockInput
                    id="image-dialog-alt"
                    label="Alt text"
                    hint="Describes the image for screen readers and search."
                    placeholder="Description of the image"
                    value={alt}
                    onChange={(e) => setAlt(e.target.value)}
                />
            </form>
        </PaddockDialog>
    );
}
