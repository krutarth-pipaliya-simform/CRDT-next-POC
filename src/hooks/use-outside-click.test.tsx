/**
 * @jest-environment jsdom
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { useRef } from "react";

import { useOutsideClick } from "@/hooks/use-outside-click";

interface HarnessProps {
    onOutside: () => void;
    enabled?: boolean;
}

function Harness({ onOutside, enabled }: HarnessProps) {
    const ref = useRef<HTMLDivElement>(null);
    useOutsideClick(ref, onOutside, enabled);
    return (
        <div>
            <div ref={ref}>
                <button>inside</button>
            </div>
            <button>outside</button>
        </div>
    );
}

describe("useOutsideClick", () => {
    it("fires for a press outside the element only", () => {
        const onOutside = jest.fn();
        render(<Harness onOutside={onOutside} />);

        fireEvent.mouseDown(screen.getByText("inside"));
        expect(onOutside).not.toHaveBeenCalled();

        fireEvent.mouseDown(screen.getByText("outside"));
        expect(onOutside).toHaveBeenCalledTimes(1);
    });

    it("does nothing while disabled", () => {
        const onOutside = jest.fn();
        render(<Harness onOutside={onOutside} enabled={false} />);

        fireEvent.mouseDown(screen.getByText("outside"));
        expect(onOutside).not.toHaveBeenCalled();
    });

    it("stops listening after unmount", () => {
        const onOutside = jest.fn();
        const { unmount } = render(<Harness onOutside={onOutside} />);
        unmount();

        fireEvent.mouseDown(document.body);
        expect(onOutside).not.toHaveBeenCalled();
    });
});
