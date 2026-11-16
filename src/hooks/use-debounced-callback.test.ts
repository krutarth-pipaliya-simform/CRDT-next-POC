/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";

import { useDebouncedCallback } from "@/hooks/use-debounced-callback";

beforeEach(() => {
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
});

describe("useDebouncedCallback", () => {
    it("collapses a burst into one trailing call with the last arguments", () => {
        const callback = jest.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 300),
        );

        act(() => {
            result.current.schedule("a");
            jest.advanceTimersByTime(200);
            result.current.schedule("b");
            jest.advanceTimersByTime(200);
        });
        expect(callback).not.toHaveBeenCalled();

        act(() => {
            jest.advanceTimersByTime(100);
        });
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith("b");
    });

    it("always runs the latest callback", () => {
        const first = jest.fn();
        const second = jest.fn();
        const { result, rerender } = renderHook(
            ({ cb }) => useDebouncedCallback(cb, 100),
            { initialProps: { cb: first } },
        );

        act(() => result.current.schedule());
        rerender({ cb: second });
        act(() => {
            jest.advanceTimersByTime(100);
        });

        expect(first).not.toHaveBeenCalled();
        expect(second).toHaveBeenCalledTimes(1);
    });

    it("flush runs the pending call immediately, once", () => {
        const callback = jest.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 300),
        );

        act(() => {
            result.current.schedule(1);
            result.current.flush();
            result.current.flush();
            jest.advanceTimersByTime(1000);
        });

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith(1);
    });

    it("cancel drops the pending call", () => {
        const callback = jest.fn();
        const { result } = renderHook(() =>
            useDebouncedCallback(callback, 300),
        );

        act(() => {
            result.current.schedule();
            result.current.cancel();
            jest.advanceTimersByTime(1000);
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it("drops a pending call on unmount by default", () => {
        const callback = jest.fn();
        const { result, unmount } = renderHook(() =>
            useDebouncedCallback(callback, 300),
        );

        act(() => result.current.schedule());
        unmount();
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(callback).not.toHaveBeenCalled();
    });

    it("flushes a pending call on unmount with flushOnUnmount", () => {
        const callback = jest.fn();
        const { result, unmount } = renderHook(() =>
            useDebouncedCallback(callback, 300, { flushOnUnmount: true }),
        );

        act(() => result.current.schedule("last"));
        unmount();
        expect(callback).toHaveBeenCalledWith("last");
    });
});
