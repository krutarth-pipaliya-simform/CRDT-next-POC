/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";

import {
    AvatarStack,
    PaddockAvatar,
} from "@/components/paddock/paddock-avatar";
import { paddockPresenceVar } from "@/components/paddock/paddock-presence";

const ada = { id: "u-ada", name: "Ada Lovelace" };

describe("PaddockAvatar", () => {
    it("is an image named after the person, filled with their hue", () => {
        render(<PaddockAvatar person={ada} />);
        const avatar = screen.getByRole("img", { name: "Ada Lovelace" });
        expect(avatar).toHaveStyle({
            backgroundColor: paddockPresenceVar(ada.id),
        });
        expect(avatar).toHaveTextContent("AL");
    });

    it("shows a single initial at small sizes", () => {
        render(<PaddockAvatar person={ada} size="sm" />);
        expect(screen.getByRole("img")).toHaveTextContent(/^A$/);
    });

    it("is hidden from assistive tech when decorative", () => {
        const { container } = render(<PaddockAvatar person={ada} decorative />);
        expect(screen.queryByRole("img")).toBeNull();
        expect(container.firstElementChild).toHaveAttribute(
            "aria-hidden",
            "true",
        );
    });

    it("covers the hue with an uploaded photo instead of initials", () => {
        const { container } = render(
            <PaddockAvatar person={{ ...ada, image: "/api/uploads/a.png" }} />,
        );
        expect(container.querySelector("img")).not.toBeNull();
        expect(
            screen.getByRole("img", { name: "Ada Lovelace" }),
        ).not.toHaveTextContent("AL");
    });
});

describe("AvatarStack", () => {
    const people = ["Ann", "Bob", "Cy", "Di", "Ed", "Flo"].map((name) => ({
        id: `u-${name}`,
        name,
    }));

    it("lists everyone in one accessible name", () => {
        render(<AvatarStack people={people.slice(0, 3)} />);
        expect(
            screen.getByRole("img", { name: "Ann, Bob, and Cy" }),
        ).toBeInTheDocument();
    });

    it("collapses extra people into a +n counter", () => {
        render(<AvatarStack people={people} max={4} />);
        expect(screen.getByText("+2")).toBeInTheDocument();
    });

    it("shows no counter when everyone fits", () => {
        render(<AvatarStack people={people.slice(0, 2)} />);
        expect(screen.queryByText(/^\+/)).toBeNull();
    });
});
