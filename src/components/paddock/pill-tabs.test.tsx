/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";

import { PillTabs, pillTabIds } from "@/components/paddock/pill-tabs";

const items = [
    { value: "a", label: "Alpha", count: 3 },
    { value: "b", label: "Beta" },
    { value: "c", label: "Gamma" },
];

function Harness({ onChange }: { onChange?: (value: string) => void }) {
    const [value, setValue] = useState("a");
    return (
        <PillTabs
            items={items}
            value={value}
            onChange={(next) => {
                setValue(next);
                onChange?.(next);
            }}
            label="Lists"
            idBase="lists"
        />
    );
}

describe("pillTabIds", () => {
    it("derives matching tab and panel ids", () => {
        expect(pillTabIds("lists", "a")).toEqual({
            tabId: "lists-tab-a",
            panelId: "lists-panel-a",
        });
    });
});

describe("PillTabs", () => {
    it("is a labelled tablist with one tab stop on the selected tab", () => {
        render(<Harness />);
        expect(
            screen.getByRole("tablist", { name: "Lists" }),
        ).toBeInTheDocument();

        const alpha = screen.getByRole("tab", { name: /Alpha/ });
        expect(alpha).toHaveAttribute("aria-selected", "true");
        expect(alpha).toHaveAttribute("tabindex", "0");
        expect(alpha).toHaveAttribute("aria-controls", "lists-panel-a");
        expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute(
            "tabindex",
            "-1",
        );
        expect(alpha).toHaveTextContent("3");
    });

    it("selects on click", async () => {
        const onChange = jest.fn();
        render(<Harness onChange={onChange} />);
        await userEvent.click(screen.getByRole("tab", { name: "Gamma" }));
        expect(onChange).toHaveBeenCalledWith("c");
        expect(screen.getByRole("tab", { name: "Gamma" })).toHaveAttribute(
            "aria-selected",
            "true",
        );
    });

    it("moves and selects with the arrow keys, wrapping at both ends", async () => {
        render(<Harness />);
        screen.getByRole("tab", { name: /Alpha/ }).focus();

        await userEvent.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: "Beta" })).toHaveFocus();
        expect(screen.getByRole("tab", { name: "Beta" })).toHaveAttribute(
            "aria-selected",
            "true",
        );

        await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
        // Beta -> Alpha -> wraps to Gamma
        expect(screen.getByRole("tab", { name: "Gamma" })).toHaveFocus();

        await userEvent.keyboard("{ArrowRight}");
        expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveFocus();
    });

    it("jumps with Home and End and ignores other keys", async () => {
        const onChange = jest.fn();
        render(<Harness onChange={onChange} />);
        screen.getByRole("tab", { name: /Alpha/ }).focus();

        await userEvent.keyboard("{End}");
        expect(screen.getByRole("tab", { name: "Gamma" })).toHaveFocus();
        await userEvent.keyboard("{Home}");
        expect(screen.getByRole("tab", { name: /Alpha/ })).toHaveFocus();

        onChange.mockClear();
        await userEvent.keyboard("x");
        expect(onChange).not.toHaveBeenCalled();
    });
});
