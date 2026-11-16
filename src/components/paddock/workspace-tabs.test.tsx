/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { WorkspaceTabs } from "@/components/paddock/workspace-tabs";

const items = [
    { label: "Overview", href: "/w1", current: true },
    { label: "Tasks", href: "/w1/tasks" },
];

describe("WorkspaceTabs", () => {
    it("is a labelled navigation landmark of links", () => {
        render(<WorkspaceTabs items={items} label="Workspace sections" />);
        const nav = screen.getByRole("navigation", {
            name: "Workspace sections",
        });
        expect(nav).toBeInTheDocument();
        expect(screen.getAllByRole("link")).toHaveLength(2);
    });

    it("marks only the current page, as a lime pill without a scribble", () => {
        render(<WorkspaceTabs items={items} label="Sections" />);
        const current = screen.getByRole("link", { name: "Overview" });
        const other = screen.getByRole("link", { name: "Tasks" });

        expect(current).toHaveAttribute("aria-current", "page");
        expect(other).not.toHaveAttribute("aria-current");
        expect(current.firstElementChild).toHaveClass("bg-paddock-lime");
        // Only a non-current tab carries the hover scribble.
        expect(current.querySelector("svg")).toBeNull();
        expect(other.querySelector("svg")).not.toBeNull();
    });
});
