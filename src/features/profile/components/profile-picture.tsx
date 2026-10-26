"use client";

import {
    useActionState,
    useId,
    useRef,
    useState,
    type ChangeEvent,
} from "react";
import Image from "next/image";

import { PaddockButton } from "@/components/paddock/paddock-button";
import { paddockPresenceVar } from "@/components/paddock/paddock-presence";
import {
    removeProfilePicture,
    uploadProfilePicture,
} from "@/features/profile/actions/upload-image";
import { cn } from "@/lib/cn";

import { ProfileNotice, ProfileSection } from "./profile-section";

export interface ProfilePictureProps {
    initialImageUrl?: string | null;
    initials: string;
    /** Colours the initials in the person's own hue. Optional for older callers. */
    userId?: string;
}

export function ProfilePicture({
    initialImageUrl,
    initials,
    userId,
}: ProfilePictureProps) {
    const [uploadState, uploadAction, isUploading] = useActionState(
        uploadProfilePicture,
        null,
    );
    const [removeState, removeAction, isRemoving] = useActionState(
        removeProfilePicture,
        null,
    );
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const fileInputId = useId();
    const hintId = useId();

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
    const showImage = Boolean(displayUrl) && !removeState?.success;

    return (
        <ProfileSection
            serif="Profile"
            heavy="picture"
            description="Upload a new profile picture or remove the existing one."
        >
            <div className="flex flex-wrap items-center gap-7">
                <span
                    role="img"
                    aria-label={
                        showImage
                            ? "Your profile picture"
                            : `Your avatar, initials ${initials}`
                    }
                    style={
                        userId
                            ? { backgroundColor: paddockPresenceVar(userId) }
                            : undefined
                    }
                    className={cn(
                        "paddock-heavy relative flex size-32 shrink-0 items-center justify-center overflow-hidden rounded-full text-[2.75rem]",
                        userId
                            ? "text-paddock-on-fill"
                            : "bg-paddock-inverse text-paddock-on-inverse",
                    )}
                >
                    {showImage && displayUrl ? (
                        <Image
                            src={displayUrl}
                            alt=""
                            fill
                            sizes="128px"
                            className="object-cover"
                            unoptimized={isBlobUrl}
                        />
                    ) : (
                        <span aria-hidden="true">{initials}</span>
                    )}
                </span>

                <div className="flex min-w-0 flex-[1_1_16.25rem] flex-col gap-3.5">
                    {uploadState?.error && (
                        <ProfileNotice intent="danger">
                            {uploadState.error}
                        </ProfileNotice>
                    )}
                    {removeState?.error && (
                        <ProfileNotice intent="danger">
                            {removeState.error}
                        </ProfileNotice>
                    )}
                    {uploadState?.success && (
                        <ProfileNotice intent="success">
                            {uploadState.data?.message}
                        </ProfileNotice>
                    )}
                    {removeState?.success && (
                        <ProfileNotice intent="success">
                            {removeState.data?.message}
                        </ProfileNotice>
                    )}

                    <div className="flex flex-wrap items-end gap-2.5">
                        <form
                            action={uploadAction}
                            className="flex min-w-0 flex-[1_1_16rem] flex-col gap-2.5"
                        >
                            <label
                                htmlFor={fileInputId}
                                className="text-sm font-semibold text-paddock-ink"
                            >
                                Choose an image
                            </label>
                            <input
                                id={fileInputId}
                                type="file"
                                name="file"
                                accept="image/jpeg,image/png,image/webp"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                aria-describedby={hintId}
                                className={cn(
                                    "block w-full min-w-0 cursor-pointer text-sm font-medium text-paddock-subtle",
                                    "file:mr-3 file:h-11 file:cursor-pointer file:rounded-paddock file:border-[1.5px] file:border-solid file:border-paddock-ink",
                                    "file:bg-transparent file:px-4 file:text-sm file:font-semibold file:text-paddock-ink hover:file:bg-paddock-ink/8",
                                )}
                            />
                            <div>
                                <PaddockButton
                                    type="submit"
                                    size="sm"
                                    disabled={isUploading}
                                >
                                    {isUploading ? "Uploading..." : "Upload"}
                                </PaddockButton>
                            </div>
                        </form>

                        {(initialImageUrl || displayUrl) &&
                            !removeState?.success && (
                                <form action={removeAction}>
                                    <PaddockButton
                                        type="submit"
                                        variant="outline"
                                        voice="plain"
                                        size="sm"
                                        disabled={isRemoving}
                                        className="border-paddock-danger text-paddock-danger"
                                    >
                                        {isRemoving ? "Removing..." : "Remove"}
                                    </PaddockButton>
                                </form>
                            )}
                    </div>
                    <p
                        id={hintId}
                        className="m-0 text-[0.78125rem] text-paddock-subtle"
                    >
                        Allowed formats: JPEG, PNG, WebP. Max size: 5MB.
                    </p>
                </div>
            </div>
        </ProfileSection>
    );
}
