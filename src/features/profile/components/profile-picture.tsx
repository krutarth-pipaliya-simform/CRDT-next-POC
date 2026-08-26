"use client";

import { useActionState, useRef, useState, type ChangeEvent } from "react";
import Image from "next/image";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader, CardTitle } from "@/components/ui/card";
import {
    removeProfilePicture,
    uploadProfilePicture,
} from "@/features/profile/actions/upload-image";

export interface ProfilePictureProps {
    initialImageUrl?: string | null;
    initials: string;
}

export function ProfilePicture({
    initialImageUrl,
    initials,
}: ProfilePictureProps) {
    const [uploadState, uploadAction] = useActionState(
        uploadProfilePicture,
        null,
    );
    const [removeState, removeAction] = useActionState(
        removeProfilePicture,
        null,
    );
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const displayUrl =
        previewUrl || uploadState?.data?.imageUrl || initialImageUrl;
    const isBlobUrl = displayUrl?.startsWith("blob:");

    // Clear preview if remove succeeds
    if (removeState?.success && displayUrl === initialImageUrl) {
        // This is a bit tricky with React 19, we might just rely on server revalidation to refresh initialImageUrl
        // but we can clear preview here
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <p className="text-sm text-brand-ink/70 font-brand-sans">
                    Upload a new profile picture or remove the existing one.
                </p>
            </CardHeader>
            <CardBody>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex-shrink-0 relative w-32 h-32 rounded-full overflow-hidden bg-brand-muted border-4 border-brand-accent flex items-center justify-center text-3xl font-brand-mono text-brand-ink">
                        {displayUrl && !removeState?.success ? (
                            <Image
                                src={displayUrl}
                                alt="Profile"
                                fill
                                className="object-cover"
                                unoptimized={isBlobUrl}
                            />
                        ) : (
                            <span>{initials}</span>
                        )}
                    </div>

                    <div className="flex-grow space-y-4 w-full">
                        {uploadState?.error && (
                            <Alert intent="danger">{uploadState.error}</Alert>
                        )}
                        {removeState?.error && (
                            <Alert intent="danger">{removeState.error}</Alert>
                        )}
                        {uploadState?.success && (
                            <Alert intent="success">
                                {uploadState.data?.message}
                            </Alert>
                        )}
                        {removeState?.success && (
                            <Alert intent="success">
                                {removeState.data?.message}
                            </Alert>
                        )}

                        <div className="flex flex-wrap gap-4">
                            <form
                                action={uploadAction}
                                className="flex flex-col gap-2"
                            >
                                <input
                                    type="file"
                                    name="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-brand-ink
                                        file:mr-4 file:py-2 file:px-4
                                        file:rounded-brand file:border-2 file:border-brand-ink
                                        file:text-sm file:font-semibold file:font-brand-mono file:uppercase
                                        file:bg-brand-surface file:text-brand-ink
                                        hover:file:bg-brand-muted cursor-pointer"
                                />
                                <Button
                                    type="submit"
                                    size="sm"
                                    pendingText="Uploading..."
                                >
                                    Upload
                                </Button>
                            </form>

                            {(initialImageUrl || displayUrl) &&
                                !removeState?.success && (
                                    <form
                                        action={removeAction}
                                        className="mt-auto"
                                    >
                                        <Button
                                            type="submit"
                                            variant="danger"
                                            size="sm"
                                            pendingText="Removing..."
                                        >
                                            Remove
                                        </Button>
                                    </form>
                                )}
                        </div>
                        <p className="text-xs text-brand-ink/70">
                            Allowed formats: JPEG, PNG, WebP. Max size: 5MB.
                        </p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
