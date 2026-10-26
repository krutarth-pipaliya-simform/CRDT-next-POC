import type { WorkspaceRole } from "@/schemas/workspace";

/** A workspace as the app shell needs it: enough to switch to it and label it. */
export interface ShellWorkspace {
    id: string;
    name: string;
    role: WorkspaceRole;
}

/** A recent document, already formatted for the menu overlay's drifting cards. */
export interface ShellRecentDocument {
    id: string;
    title: string;
    /** "edited 9m ago", set in mono. */
    meta: string;
}
