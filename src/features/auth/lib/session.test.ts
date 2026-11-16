import { requireUserId } from "@/features/auth/lib/session";
import { auth, signInAs, signOutSession } from "@/test/mock-auth";

jest.mock("@/features/auth/lib/auth", () =>
    jest.requireActual("@/test/mock-auth"),
);
jest.mock("next/navigation", () => ({
    redirect: jest.fn((url: string) => {
        throw new Error(`REDIRECT:${url}`);
    }),
}));

describe("requireUserId", () => {
    it("returns the signed-in user's id", async () => {
        signInAs("u1");
        await expect(requireUserId()).resolves.toBe("u1");
        expect(auth).toHaveBeenCalled();
    });

    it("redirects a signed-out visitor to login", async () => {
        signOutSession();
        await expect(requireUserId()).rejects.toThrow("REDIRECT:/login");
    });

    it("treats a session without a user id as signed out", async () => {
        auth.mockResolvedValue({ user: {} });
        await expect(requireUserId()).rejects.toThrow("REDIRECT:/login");
    });

    it("carries a same-origin path as the login callback", async () => {
        signOutSession();
        await expect(requireUserId("/w1/tasks?x=1")).rejects.toThrow(
            `REDIRECT:/login?callbackUrl=${encodeURIComponent("/w1/tasks?x=1")}`,
        );
    });

    it.each(["//evil.example", "https://evil.example", "evil"])(
        "drops the unsafe return path %s",
        async (returnTo) => {
            signOutSession();
            await expect(requireUserId(returnTo)).rejects.toThrow(
                "REDIRECT:/login",
            );
            await expect(requireUserId(returnTo)).rejects.not.toThrow(
                /callbackUrl/,
            );
        },
    );
});
