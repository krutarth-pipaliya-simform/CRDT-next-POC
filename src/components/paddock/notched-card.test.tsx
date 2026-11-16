/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { NotchedCard } from "@/components/paddock/notched-card";

describe("NotchedCard", () => {
    it("renders children in the chosen element", () => {
        render(
            <NotchedCard as="article">
                <p>Body</p>
            </NotchedCard>,
        );
        expect(screen.getByRole("article")).toContainElement(
            screen.getByText("Body"),
        );
    });

    it("cuts the bottom corner by default and the top on request", () => {
        const { container, rerender } = render(<NotchedCard>x</NotchedCard>);
        expect(container.firstElementChild).toHaveClass("paddock-notch");

        rerender(<NotchedCard notch="top">x</NotchedCard>);
        expect(container.firstElementChild).toHaveClass("paddock-notch-top");
    });

    it("sets the tab label only when given, in lime on night grounds", () => {
        const { rerender } = render(<NotchedCard>x</NotchedCard>);
        expect(document.querySelector(".paddock-tag")).toBeNull();

        rerender(
            <NotchedCard tab="Pro" tone="night">
                x
            </NotchedCard>,
        );
        expect(screen.getByText("Pro")).toHaveClass("text-paddock-lime");
    });
});
