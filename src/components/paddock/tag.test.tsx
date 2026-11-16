/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { Tag } from "@/components/paddock/tag";

describe("Tag", () => {
    it("renders sentence-case text in a span with the subtle tone", () => {
        render(<Tag>Last edited</Tag>);
        const tag = screen.getByText("Last edited");
        expect(tag.tagName).toBe("SPAN");
        expect(tag).toHaveClass("paddock-tag", "text-paddock-subtle");
        // The caps are CSS: the DOM text stays as written.
        expect(tag).toHaveTextContent("Last edited");
    });

    it("supports other elements and tones", () => {
        render(
            <Tag as="legend" tone="lime" className="extra">
                Choose
            </Tag>,
        );
        const tag = screen.getByText("Choose");
        expect(tag.tagName).toBe("LEGEND");
        expect(tag).toHaveClass("text-paddock-lime", "extra");
    });
});
