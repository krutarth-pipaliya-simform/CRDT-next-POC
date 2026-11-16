/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { BackLink } from "@/components/paddock/back-link";

describe("BackLink", () => {
    it("is a real link to the parent route with the label", () => {
        render(<BackLink href="/w1/documents" label="Documents" />);
        const link = screen.getByRole("link", { name: "Documents" });
        expect(link).toHaveAttribute("href", "/w1/documents");
    });

    it("prefers an explicit aria-label", () => {
        render(
            <BackLink
                href="/dashboard"
                label="All workspaces"
                aria-label="Back to all workspaces"
            />,
        );
        expect(
            screen.getByRole("link", { name: "Back to all workspaces" }),
        ).toHaveAttribute("href", "/dashboard");
    });
});
