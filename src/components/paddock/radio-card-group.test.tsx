/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RadioCardGroup } from "@/components/paddock/radio-card-group";

const options = [
    {
        value: "PRIVATE",
        label: "Private",
        badge: "Restricted",
        description: "Members only",
    },
    {
        value: "PUBLIC",
        label: "Public",
        badge: "Open",
        description: "Anyone can view",
    },
];

describe("RadioCardGroup", () => {
    it("is a named group of radios, each described by its card", () => {
        render(
            <RadioCardGroup
                name="visibility"
                legend="Visibility"
                options={options}
                defaultValue="PRIVATE"
            />,
        );
        expect(
            screen.getByRole("group", { name: "Visibility" }),
        ).toBeInTheDocument();

        const radios = screen.getAllByRole("radio");
        expect(radios).toHaveLength(2);
        expect(screen.getByRole("radio", { name: /Private/ })).toBeChecked();
        expect(
            screen.getByRole("radio", { name: /Public/ }),
        ).toHaveAccessibleDescription("Anyone can view");
    });

    it("lets the user choose another option natively", async () => {
        render(
            <RadioCardGroup
                name="visibility"
                legend="Visibility"
                options={options}
                defaultValue="PRIVATE"
            />,
        );
        await userEvent.click(screen.getByText("Public"));
        expect(screen.getByRole("radio", { name: /Public/ })).toBeChecked();
        expect(
            screen.getByRole("radio", { name: /Private/ }),
        ).not.toBeChecked();
    });

    it("selects nothing without a default", () => {
        render(<RadioCardGroup name="v" legend="V" options={options} />);
        for (const radio of screen.getAllByRole("radio")) {
            expect(radio).not.toBeChecked();
        }
    });
});
