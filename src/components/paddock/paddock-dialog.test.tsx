/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PaddockDialog } from "@/components/paddock/paddock-dialog";

// jsdom does not implement the modal parts of <dialog>.
beforeAll(() => {
    HTMLDialogElement.prototype.showModal = function showModal() {
        this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function close() {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
    };
});

describe("PaddockDialog", () => {
    it("names itself from the two-voice title and describes itself", () => {
        render(
            <PaddockDialog
                open
                onClose={jest.fn()}
                titleSerif="New"
                titleHeavy="task"
                description="Add it to the board"
            >
                <p>Form</p>
            </PaddockDialog>,
        );
        const dialog = screen.getByRole("dialog", { name: "New task" });
        expect(dialog).toHaveAccessibleDescription("Add it to the board");
        expect(screen.getByText("Form")).toBeInTheDocument();
    });

    it("renders body and footer only while open", () => {
        const { rerender } = render(
            <PaddockDialog
                open={false}
                onClose={jest.fn()}
                titleSerif="A"
                titleHeavy="b"
                footer={<button>Save</button>}
            >
                <p>Secret</p>
            </PaddockDialog>,
        );
        expect(screen.queryByText("Secret")).toBeNull();
        expect(screen.queryByText("Save")).toBeNull();

        rerender(
            <PaddockDialog
                open
                onClose={jest.fn()}
                titleSerif="A"
                titleHeavy="b"
                footer={<button>Save</button>}
            >
                <p>Secret</p>
            </PaddockDialog>,
        );
        expect(screen.getByText("Secret")).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
    });

    it("closes from the close button", async () => {
        const onClose = jest.fn();
        render(
            <PaddockDialog open onClose={onClose} titleSerif="A" titleHeavy="b">
                x
            </PaddockDialog>,
        );
        await userEvent.click(
            screen.getByRole("button", { name: "Close dialog" }),
        );
        expect(onClose).toHaveBeenCalled();
    });
});
