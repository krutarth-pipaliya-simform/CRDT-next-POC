/**
 * @jest-environment jsdom
 */
import { render, screen, within } from "@testing-library/react";

import { PlanCard } from "@/components/paddock/plan-card";

const base = {
    name: "Pro",
    tagline: "For teams",
    price: "$12",
    cadence: "per workspace / month",
    features: ["Everything in Free", "30-day analytics"],
};

describe("PlanCard", () => {
    it("lays out the plan from the catalogue values", () => {
        render(<PlanCard {...base} />);
        const card = screen.getByRole("article");
        expect(
            within(card).getByRole("heading", { name: "Pro" }),
        ).toBeInTheDocument();
        expect(within(card).getByText("$12")).toBeInTheDocument();
        expect(
            within(card).getByText("per workspace / month"),
        ).toBeInTheDocument();
        expect(within(card).getAllByRole("listitem")).toHaveLength(2);
    });

    it("marks the current plan and omits the action area without one", () => {
        const { rerender } = render(<PlanCard {...base} />);
        expect(screen.queryByText("Current plan")).toBeNull();

        rerender(<PlanCard {...base} current />);
        expect(screen.getByText("Current plan")).toBeInTheDocument();
    });

    it("renders the action when given", () => {
        render(<PlanCard {...base} action={<button>Upgrade</button>} />);
        expect(
            screen.getByRole("button", { name: "Upgrade" }),
        ).toBeInTheDocument();
    });

    it("sets the featured plan on night with lime cadence text", () => {
        render(<PlanCard {...base} featured />);
        expect(screen.getByText("per workspace / month")).toHaveClass(
            "text-paddock-lime",
        );
    });
});
