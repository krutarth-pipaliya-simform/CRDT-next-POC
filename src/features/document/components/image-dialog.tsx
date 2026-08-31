"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";

export interface ImageDialogProps {
    open: boolean;
    onClose: () => void;
    onInsert: (data: { src: string; alt?: string }) => void;
}

export function ImageDialog({ open, onClose, onInsert }: ImageDialogProps) {
    const [url, setUrl] = useState("");
    const [alt, setAlt] = useState("");
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select a valid image file");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError("Image size must be less than 5MB");
            return;
        }

        setError(null);
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (typeof result === "string") {
                setUrl(result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!url || url.trim().length === 0) {
            setError("Please provide an image URL or upload a file");
            return;
        }

        onInsert({ src: url.trim(), alt: alt.trim() || undefined });
        setUrl("");
        setAlt("");
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} title="Insert Image">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <FormField
                    label="Image URL"
                    htmlFor="image-dialog-url"
                    error={error ?? undefined}
                >
                    <Input
                        id="image-dialog-url"
                        type="url"
                        placeholder="https://example.com/image.png"
                        value={
                            url.startsWith("data:") ? "(File selected)" : url
                        }
                        onChange={(e) => {
                            setUrl(e.target.value);
                            setError(null);
                        }}
                    />
                </FormField>

                <div className="flex items-center gap-2">
                    <span className="text-xs font-brand-mono uppercase tracking-wider text-brand-subtle">
                        OR
                    </span>
                    <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-brand-mono uppercase tracking-wider bg-brand-muted hover:bg-brand-border border border-brand-ink rounded-brand cursor-pointer text-brand-ink transition-colors">
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Upload File</span>
                        <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/gif"
                            onChange={handleFileChange}
                            className="sr-only"
                        />
                    </label>
                </div>

                <FormField
                    label="Alt Text (Accessibility)"
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
                    <Button type="button" variant="secondary" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                        <ImageIcon
                            className="w-4 h-4 mr-1.5"
                            aria-hidden="true"
                        />
                        Insert Image
                    </Button>
                </div>
            </form>
        </Dialog>
    );
}
