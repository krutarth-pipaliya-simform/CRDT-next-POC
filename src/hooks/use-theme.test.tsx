/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import type { ReactNode } from "react";

import {
    ThemeContext,
    type ThemeContextValue,
} from "@/components/theme/theme-provider";
import { useTheme } from "@/hooks/use-theme";

describe("useTheme", () => {
    it("returns the provided context value", () => {
        const value: ThemeContextValue = {
            preference: "dark",
            resolvedTheme: "dark",
            setPreference: jest.fn(),
            ready: true,
        };
        const wrapper = ({ children }: { children: ReactNode }) => (
            <ThemeContext.Provider value={value}>
                {children}
            </ThemeContext.Provider>
        );

        const { result } = renderHook(() => useTheme(), { wrapper });
        expect(result.current).toBe(value);
    });

    it("throws a clear error outside a ThemeProvider", () => {
        const spy = jest.spyOn(console, "error").mockImplementation(() => {});
        expect(() => renderHook(() => useTheme())).toThrow(
            "useTheme must be used within a ThemeProvider",
        );
        spy.mockRestore();
    });
});
