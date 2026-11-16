/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
    BurgerButton,
    PaddockButton,
    PaddockIconButton,
    PaddockLinkButton,
} from "@/components/paddock/paddock-button";

describe("PaddockButton", () => {
    it("is a non-submitting button by default and forwards clicks", async () => {
        const onClick = jest.fn();
        render(<PaddockButton onClick={onClick}>Save</PaddockButton>);

        const button = screen.getByRole("button", { name: "Save" });
        expect(button).toHaveAttribute("type", "button");
        await userEvent.click(button);
        expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("can be a submit button and can be disabled", async () => {
        const onClick = jest.fn();
        render(
            <PaddockButton type="submit" disabled onClick={onClick}>
                Go
            </PaddockButton>,
        );
        const button = screen.getByRole("button", { name: "Go" });
        expect(button).toHaveAttribute("type", "submit");
        await userEvent.click(button);
        expect(onClick).not.toHaveBeenCalled();
    });

    it("applies variant classes", () => {
        render(<PaddockButton variant="danger">Delete</PaddockButton>);
        expect(screen.getByRole("button")).toHaveClass("bg-paddock-danger");
    });
});

describe("PaddockLinkButton", () => {
    it("renders a styled anchor, not a button", () => {
        render(<PaddockLinkButton href="/dashboard">Open</PaddockLinkButton>);
        const link = screen.getByRole("link", { name: "Open" });
        expect(link).toHaveAttribute("href", "/dashboard");
        expect(link).toHaveClass("rounded-paddock");
        expect(screen.queryByRole("button")).toBeNull();
    });
});

describe("PaddockIconButton", () => {
    it("takes its accessible name from `label` and hides the icon", async () => {
        const onClick = jest.fn();
        render(
            <PaddockIconButton
                label="Close"
                icon={<svg data-testid="icon" />}
                onClick={onClick}
            />,
        );
        const button = screen.getByRole("button", { name: "Close" });
        expect(button.querySelector("[aria-hidden='true']")).not.toBeNull();
        await userEvent.click(button);
        expect(onClick).toHaveBeenCalled();
    });
});

describe("BurgerButton", () => {
    it("announces open and closed state", () => {
        const { rerender } = render(
            <BurgerButton open={false} controls="menu" />,
        );
        let button = screen.getByRole("button", { name: "Open menu" });
        expect(button).toHaveAttribute("aria-expanded", "false");
        expect(button).toHaveAttribute("aria-controls", "menu");

        rerender(<BurgerButton open controls="menu" />);
        button = screen.getByRole("button", { name: "Close menu" });
        expect(button).toHaveAttribute("aria-expanded", "true");
    });
});
