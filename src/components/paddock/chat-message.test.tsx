/**
 * @jest-environment jsdom
 */
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ChatMessage, Mention } from "@/components/paddock/chat-message";

const author = { id: "u1", name: "Maya Okafor" };
const base = { author, time: "10:05", dateTime: "2026-01-01T10:05:00.000Z" };

describe("ChatMessage", () => {
    it("shows the author's name flag and time on the first message of a run", () => {
        render(<ChatMessage {...base}>Hello team</ChatMessage>);
        expect(
            screen.getByRole("article", { name: "Maya Okafor, 10:05" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Maya Okafor")).toBeInTheDocument();
        expect(screen.getByText("10:05")).toHaveAttribute(
            "datetime",
            base.dateTime,
        );
        expect(screen.getByText("Hello team")).toBeInTheDocument();
    });

    it("omits the header for a follow-up message", () => {
        render(
            <ChatMessage {...base} first={false}>
                Again
            </ChatMessage>,
        );
        expect(screen.queryByText("Maya Okafor")).toBeNull();
        expect(screen.queryByText("10:05")).toBeNull();
        expect(screen.getByText("Again")).toBeInTheDocument();
    });

    it("dims a pending message", () => {
        render(
            <ChatMessage {...base} pending>
                Sending
            </ChatMessage>,
        );
        expect(screen.getByRole("article")).toHaveClass("opacity-60");
    });

    it("offers a retry for a failed message", async () => {
        const onRetry = jest.fn();
        render(
            <ChatMessage {...base} failed onRetry={onRetry}>
                Oops
            </ChatMessage>,
        );
        expect(screen.getByText(/Not sent/)).toBeInTheDocument();
        await userEvent.click(
            screen.getByRole("button", { name: "Try again" }),
        );
        expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("shows no retry for a delivered message", () => {
        render(<ChatMessage {...base}>ok</ChatMessage>);
        expect(screen.queryByRole("button")).toBeNull();
    });
});

describe("Mention", () => {
    it("shows @ and the first name only", () => {
        render(<Mention person={author} />);
        expect(screen.getByText("@Maya")).toBeInTheDocument();
    });
});
