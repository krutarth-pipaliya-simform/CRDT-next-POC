"use client";

import { useState } from "react";

import { PillTabs, pillTabIds } from "@/components/paddock/pill-tabs";

type WorkspaceList = "mine" | "public";

const ITEMS = [
    { value: "mine", label: "My workspaces", count: 3 },
    { value: "public", label: "Discover public", count: 12 },
] satisfies { value: WorkspaceList; label: string; count: number }[];

const PANEL_COPY: Record<WorkspaceList, string> = {
    mine: "Halden Studio, Northwind and Field Notes — the three you belong to.",
    public: "Twelve public workspaces anyone can find and join.",
};

/** The dashboard's list switch, with the panel it controls. */
export function PillTabsDemo() {
    const [value, setValue] = useState<WorkspaceList>("mine");
    const idBase = "demo-workspace-lists";
    const { tabId, panelId } = pillTabIds(idBase, value);

    return (
        <div className="flex flex-col gap-4">
            <PillTabs
                items={ITEMS}
                value={value}
                onChange={setValue}
                label="Workspace lists"
                idBase={idBase}
            />
            <div
                role="tabpanel"
                id={panelId}
                aria-labelledby={tabId}
                tabIndex={0}
                className="rounded-paddock-card border border-paddock-rule bg-paddock-sheet px-5 py-4"
            >
                {PANEL_COPY[value]}
            </div>
        </div>
    );
}
