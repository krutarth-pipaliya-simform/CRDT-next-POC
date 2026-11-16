/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";

import { useDebouncedValue } from "@/hooks/use-debounced-value";

beforeEach(() => {
    jest.useFakeTimers();
});
afterEach(() => {
    jest.useRealTimers();
});

describe("useDebouncedValue", () => {
    it("starts with the initial value", () => {
        const { result } = renderHook(() => useDebouncedValue("a", 200));
        expect(result.current).toBe("a");
    });

    it("only adopts a new value once it stops changing", () => {
        const { result, rerender } = renderHook(
            ({ value }) => useDebouncedValue(value, 200),
            { initialProps: { value: "a" } },
        );

        rerender({ value: "b" });
        act(() => {
            jest.advanceTimersByTime(150);
        });
        rerender({ value: "c" });
        act(() => {
            jest.advanceTimersByTime(150);
        });
        expect(result.current).toBe("a");

        act(() => {
            jest.advanceTimersByTime(50);
        });
        expect(result.current).toBe("c");
    });
});
