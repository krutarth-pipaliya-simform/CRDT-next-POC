/**
 * @jest-environment jsdom
 */
import { act, renderHook } from "@testing-library/react";

import { useShellPanel, useShellUiStore } from "@/stores/shell-ui-store";

beforeEach(() => {
    useShellUiStore.setState({ openPanel: null });
});

describe("useShellUiStore", () => {
    it("opens a panel and closes it on a second toggle", () => {
        const { togglePanel } = useShellUiStore.getState();

        togglePanel("menu");
        expect(useShellUiStore.getState().openPanel).toBe("menu");

        togglePanel("menu");
        expect(useShellUiStore.getState().openPanel).toBeNull();
    });

    it("keeps only one panel open at a time", () => {
        const { togglePanel } = useShellUiStore.getState();
        togglePanel("account");
        togglePanel("notifications");
        expect(useShellUiStore.getState().openPanel).toBe("notifications");
    });

    it("ignores a stale close for a panel that is not open", () => {
        const { togglePanel, closePanel } = useShellUiStore.getState();
        togglePanel("switcher");

        closePanel("menu");
        expect(useShellUiStore.getState().openPanel).toBe("switcher");

        closePanel("switcher");
        expect(useShellUiStore.getState().openPanel).toBeNull();
    });
});

describe("useShellPanel", () => {
    it("exposes open state with toggle and close", () => {
        const { result } = renderHook(() => useShellPanel("account"));
        expect(result.current.open).toBe(false);

        act(() => result.current.toggle());
        expect(result.current.open).toBe(true);

        act(() => result.current.close());
        expect(result.current.open).toBe(false);
    });

    it("closes when another panel opens", () => {
        const { result } = renderHook(() => useShellPanel("account"));
        act(() => result.current.toggle());
        act(() => useShellUiStore.getState().togglePanel("menu"));
        expect(result.current.open).toBe(false);
    });
});
