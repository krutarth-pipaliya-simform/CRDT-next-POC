/**
 * @jest-environment jsdom
 */
import { renderHook } from "@testing-library/react";
import { useParams } from "next/navigation";

import type { ShellWorkspace } from "@/components/layout/types";
import { useCurrentWorkspace } from "@/hooks/use-current-workspace";

jest.mock("next/navigation", () => ({ useParams: jest.fn() }));

const mockUseParams = jest.mocked(useParams);

const workspaces: ShellWorkspace[] = [
    { id: "w1", name: "One", role: "ADMIN" },
    { id: "w2", name: "Two", role: "MEMBER" },
];

describe("useCurrentWorkspace", () => {
    it("finds the member workspace named by the route", () => {
        mockUseParams.mockReturnValue({ workspaceId: "w2" });
        const { result } = renderHook(() => useCurrentWorkspace(workspaces));
        expect(result.current).toEqual({
            workspaceId: "w2",
            workspace: workspaces[1],
        });
    });

    it("has an id but no membership for a workspace the user is not in", () => {
        mockUseParams.mockReturnValue({ workspaceId: "public-1" });
        const { result } = renderHook(() => useCurrentWorkspace(workspaces));
        expect(result.current).toEqual({
            workspaceId: "public-1",
            workspace: null,
        });
    });

    it("returns nulls outside a workspace route", () => {
        mockUseParams.mockReturnValue({});
        const { result } = renderHook(() => useCurrentWorkspace(workspaces));
        expect(result.current).toEqual({ workspaceId: null, workspace: null });
    });

    it("ignores a catch-all array segment", () => {
        mockUseParams.mockReturnValue({ workspaceId: ["a", "b"] });
        const { result } = renderHook(() => useCurrentWorkspace(workspaces));
        expect(result.current.workspaceId).toBeNull();
    });
});
