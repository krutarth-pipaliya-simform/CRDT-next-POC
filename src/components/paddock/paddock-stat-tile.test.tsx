/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import { PaddockStatTile } from "@/components/paddock/paddock-stat-tile";

describe("PaddockStatTile", () => {
    it("renders the label, the figure, the unit and the hint", () => {
        render(
            <PaddockStatTile
                label="Completion"
                value="82"
                unit="%"
                hint="of all tasks"
            />,
        );
        expect(screen.getByText("Completion")).toBeInTheDocument();
        expect(screen.getByText("82")).toBeInTheDocument();
        expect(screen.getByText("%")).toBeInTheDocument();
        expect(screen.getByText("of all tasks")).toBeInTheDocument();
    });

    it("omits the unit and hint when not given", () => {
        render(<PaddockStatTile label="Members" value="5" />);
        expect(screen.getByText("5")).toBeInTheDocument();
        expect(screen.queryByText("%")).toBeNull();
        expect(document.querySelectorAll("p")).toHaveLength(1);
    });
});
