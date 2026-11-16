/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
    PaddockInput,
    PaddockSelect,
    PaddockTextarea,
} from "@/components/paddock/paddock-field";

describe("PaddockInput", () => {
    it("wires the label to the control", async () => {
        const onChange = jest.fn();
        render(<PaddockInput id="name" label="Name" onChange={onChange} />);

        const input = screen.getByLabelText("Name");
        expect(input).toHaveAttribute("type", "text");
        await userEvent.type(input, "Ada");
        expect(onChange).toHaveBeenCalledTimes(3);
    });

    it("describes the control with its hint", () => {
        render(<PaddockInput id="email" label="Email" hint="Work address" />);
        const input = screen.getByLabelText("Email");
        expect(input).toHaveAccessibleDescription("Work address");
        expect(input).not.toHaveAttribute("aria-invalid");
    });

    it("shows an error as an alert instead of the hint and marks it invalid", () => {
        render(
            <PaddockInput
                id="email"
                label="Email"
                hint="Work address"
                error="Enter a valid email"
            />,
        );
        const input = screen.getByLabelText("Email");
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByRole("alert")).toHaveTextContent(
            "Enter a valid email",
        );
        expect(screen.queryByText("Work address")).toBeNull();
        expect(input).toHaveAccessibleDescription("Enter a valid email");
    });

    it("keeps typed values via defaultValue and honours type", () => {
        render(
            <PaddockInput
                id="pw"
                label="Password"
                type="password"
                defaultValue="kept"
            />,
        );
        expect(screen.getByLabelText("Password")).toHaveValue("kept");
        expect(screen.getByLabelText("Password")).toHaveAttribute(
            "type",
            "password",
        );
    });
});

describe("PaddockTextarea", () => {
    it("renders a labelled textarea with 3 rows by default", () => {
        render(
            <PaddockTextarea id="desc" label="Description" error="Too long" />,
        );
        const textarea = screen.getByLabelText("Description");
        expect(textarea.tagName).toBe("TEXTAREA");
        expect(textarea).toHaveAttribute("rows", "3");
        expect(textarea).toHaveAttribute("aria-invalid", "true");
    });
});

describe("PaddockSelect", () => {
    it("renders the options and reports the choice", async () => {
        const onChange = jest.fn();
        render(
            <PaddockSelect
                id="role"
                label="Role"
                onChange={onChange}
                options={[
                    { value: "MEMBER", label: "Member" },
                    { value: "ADMIN", label: "Admin" },
                ]}
            />,
        );
        const select = screen.getByLabelText("Role");
        await userEvent.selectOptions(select, "ADMIN");
        expect(select).toHaveValue("ADMIN");
        expect(onChange).toHaveBeenCalled();
        expect(screen.getAllByRole("option")).toHaveLength(2);
    });
});
