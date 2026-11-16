"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "zustand";

import type { TaskWithAssignee } from "../types";
import {
    createBoardStore,
    type BoardStore,
    type BoardStoreApi,
} from "./board-store";

const BoardStoreContext = createContext<BoardStoreApi | null>(null);

export interface BoardStoreProviderProps {
    initialTasks: TaskWithAssignee[];
    children: ReactNode;
}

/**
 * Creates the board store once per mounted board, seeded from the
 * server-rendered tasks, so the server render and the hydrating render agree
 * and nothing is shared between requests.
 */
export function BoardStoreProvider({
    initialTasks,
    children,
}: BoardStoreProviderProps) {
    const [store] = useState(() => createBoardStore(initialTasks));
    const seededRef = useRef(initialTasks);

    // The server sent a new list (a revalidation): adopt it. The store is
    // written from an effect, never during render.
    useEffect(() => {
        if (seededRef.current === initialTasks) return;
        seededRef.current = initialTasks;
        store.getState().syncTasks(initialTasks);
    }, [initialTasks, store]);

    return (
        <BoardStoreContext.Provider value={store}>
            {children}
        </BoardStoreContext.Provider>
    );
}

/** The store itself, for event handlers that read the latest state on demand. */
export function useBoardStoreApi(): BoardStoreApi {
    const store = useContext(BoardStoreContext);
    if (!store) {
        throw new Error("useBoardStore must be used within BoardStoreProvider");
    }
    return store;
}

/** Subscribe to a slice of the board; re-renders only when it changes. */
export function useBoardStore<T>(selector: (state: BoardStore) => T): T {
    return useStore(useBoardStoreApi(), selector);
}
