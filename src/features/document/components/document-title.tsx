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
            placeholder="Untitled document"
            aria-label="Document title"
            className="paddock-heavy w-full min-w-0 border-0 border-b-2 border-transparent bg-transparent py-1 text-[clamp(1.5rem,4vw,2rem)] text-paddock-ink transition-colors duration-150 placeholder:text-paddock-subtle hover:border-paddock-rule focus:border-paddock-ink disabled:cursor-not-allowed disabled:hover:border-transparent"
        />
    );
}
