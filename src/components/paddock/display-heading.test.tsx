/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { DisplayHeading } from "@/components/paddock/display-heading";

describe("DisplayHeading", () => {
    it("reads as 'serif heavy' to a screen reader, in sentence case", () => {
        render(<DisplayHeading as="h1" serif="Your" heavy="workspaces" />);
        expect(
            screen.getByRole("heading", { level: 1, name: "Your workspaces" }),
        ).toBeInTheDocument();
    });

    it("can lead with the heavy voice", () => {
        render(
            <DisplayHeading heavy="Board" serif="The" order="heavy-first" />,
        );
        expect(
            screen.getByRole("heading", { name: "Board The" }),
        ).toBeInTheDocument();
    });

    it("adds the outlined third line when given", () => {
        render(<DisplayHeading serif="a" heavy="b" outline="c" />);
        expect(screen.getByRole("heading")).toHaveTextContent("a b c");
    });

    it("supports inline layout, centring, night surface and an id", () => {
        render(
            <DisplayHeading
                id="title"
                serif="a"
                heavy="b"
                layout="inline"
                align="center"
                surface="night"
                size="sm"
            />,
        );
        const heading = screen.getByRole("heading");
        expect(heading).toHaveAttribute("id", "title");
        expect(heading).toHaveClass("flex", "text-center", "justify-center");
        expect(screen.getByText("a")).toHaveClass("text-paddock-lime");
    });
});
