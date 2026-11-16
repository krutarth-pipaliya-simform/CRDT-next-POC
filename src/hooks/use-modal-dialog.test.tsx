/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";

import { useModalDialog } from "@/hooks/use-modal-dialog";

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

interface HarnessProps {
    open: boolean;
    onRequestClose: () => void;
}

function Harness({ open, onRequestClose }: HarnessProps) {
    const bindings = useModalDialog(open, onRequestClose);
    return (
        <>
            <button>trigger</button>
            <dialog data-testid="dialog" {...bindings}>
                <input data-autofocus aria-label="name" />
                <button>ok</button>
            </dialog>
        </>
    );
}

describe("useModalDialog", () => {
    it("opens modally, focuses the data-autofocus field and locks scroll", () => {
        const { rerender } = render(
            <Harness open={false} onRequestClose={jest.fn()} />,
        );
        expect(screen.getByTestId("dialog")).not.toHaveAttribute("open");

        screen.getByText("trigger").focus();
        rerender(<Harness open onRequestClose={jest.fn()} />);

        expect(screen.getByTestId("dialog")).toHaveAttribute("open");
        expect(screen.getByLabelText("name")).toHaveFocus();
        expect(document.documentElement.style.overflow).toBe("hidden");
    });

    it("returns focus to the trigger and asks to close when it closes", () => {
        const onRequestClose = jest.fn();
        const { rerender } = render(
            <Harness open={false} onRequestClose={onRequestClose} />,
        );
        const trigger = screen.getByText("trigger");
        trigger.focus();
        rerender(<Harness open onRequestClose={onRequestClose} />);

        rerender(<Harness open={false} onRequestClose={onRequestClose} />);

        expect(screen.getByTestId("dialog")).not.toHaveAttribute("open");
        expect(trigger).toHaveFocus();
        expect(onRequestClose).toHaveBeenCalled();
        expect(document.documentElement.style.overflow).toBe("");
    });

    it("routes Escape through React instead of closing the element itself", () => {
        const onRequestClose = jest.fn();
        render(<Harness open onRequestClose={onRequestClose} />);

        const cancel = new Event("cancel", { cancelable: true });
        screen.getByTestId("dialog").dispatchEvent(cancel);

        expect(cancel.defaultPrevented).toBe(true);
        expect(onRequestClose).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId("dialog")).toHaveAttribute("open");
    });

    it("closes on a backdrop click but not a click on the content", () => {
        const onRequestClose = jest.fn();
        render(<Harness open onRequestClose={onRequestClose} />);

        fireEvent.click(screen.getByText("ok"));
        expect(onRequestClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByTestId("dialog"));
        expect(onRequestClose).toHaveBeenCalledTimes(1);
    });
});
