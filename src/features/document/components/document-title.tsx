"use client";

import { useState, type ChangeEvent } from "react";

export interface DocumentTitleProps {
    initialTitle: string;
    onTitleChange: (title: string) => void;
    disabled?: boolean;
}

export function DocumentTitle({
    initialTitle,
    onTitleChange,
    disabled = false,
}: DocumentTitleProps) {
    const [title, setTitle] = useState(initialTitle);
    const [prevInitialTitle, setPrevInitialTitle] = useState(initialTitle);

    if (prevInitialTitle !== initialTitle) {
        setPrevInitialTitle(initialTitle);
        setTitle(initialTitle);
    }

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setTitle(val);
        onTitleChange(val);
    };

    return (
        <input
            type="text"
            value={title}
            onChange={handleChange}
            disabled={disabled}
            placeholder="Untitled Document"
            aria-label="Document Title"
            className="w-full max-w-xl text-xl sm:text-2xl font-bold bg-transparent text-brand-ink placeholder:text-brand-subtle/50 border-b-2 border-transparent hover:border-brand-border focus:border-brand-accent focus:outline-none transition-colors duration-150 py-1"
        />
    );
}
