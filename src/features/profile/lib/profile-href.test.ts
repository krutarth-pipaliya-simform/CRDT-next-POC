import { profileHref } from "@/features/profile/lib/profile-href";

describe("profileHref", () => {
    it("links straight to the profile from the profile", () => {
        expect(profileHref("/profile")).toBe("/profile");
    });

    it("carries the origin path, encoded", () => {
        expect(profileHref("/w1/tasks?x=1")).toBe(
            `/profile?from=${encodeURIComponent("/w1/tasks?x=1")}`,
        );
    });
});
