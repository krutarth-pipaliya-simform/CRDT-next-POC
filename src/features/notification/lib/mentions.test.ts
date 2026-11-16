import {
    resolveMentionedUserIds,
    type MentionCandidate,
} from "@/features/notification/lib/mentions";

const people: MentionCandidate[] = [
    { userId: "ada", name: "Ada Lovelace", email: "ada.l@example.com" },
    { userId: "bob", name: "Bob", email: "bobby@example.com" },
    { userId: "cy", name: null, email: "cyrus@example.com" },
    { userId: "dee", name: "Dee", email: null },
];

describe("resolveMentionedUserIds", () => {
    it("returns nothing without an @ or without candidates", () => {
        expect(resolveMentionedUserIds("hello", people)).toEqual([]);
        expect(resolveMentionedUserIds("hi @ada", [])).toEqual([]);
    });

    it("matches a full multi-word display name", () => {
        expect(
            resolveMentionedUserIds("ping @Ada Lovelace now", people),
        ).toEqual(["ada"]);
    });

    it("matches the first word of a multi-word name", () => {
        expect(resolveMentionedUserIds("hey @ada!", people)).toEqual(["ada"]);
    });

    it("matches the local part of an email", () => {
        expect(resolveMentionedUserIds("@bobby look", people)).toEqual(["bob"]);
        expect(resolveMentionedUserIds("@cyrus look", people)).toEqual(["cy"]);
    });

    it("is case-insensitive and stops at punctuation", () => {
        expect(resolveMentionedUserIds("@BOB, @Dee.", people)).toEqual([
            "bob",
            "dee",
        ]);
    });

    it("de-duplicates repeated mentions", () => {
        expect(resolveMentionedUserIds("@bob @Bob @bobby", people)).toEqual([
            "bob",
        ]);
    });

    it("ignores unknown handles and bare @", () => {
        expect(resolveMentionedUserIds("@nobody and @ alone", people)).toEqual(
            [],
        );
    });

    it("does not treat an email address in the body as a mention of its owner twice", () => {
        // "x@bob" captures "bob" -> still resolves once.
        expect(resolveMentionedUserIds("mail x@bob", people)).toEqual(["bob"]);
    });

    it("lets the first registered candidate win a handle clash", () => {
        const clash: MentionCandidate[] = [
            { userId: "first", name: "Sam", email: null },
            { userId: "second", name: "Sam Smith", email: null },
        ];
        expect(resolveMentionedUserIds("@sam", clash)).toEqual(["first"]);
    });

    it("handles unicode names", () => {
        const unicode: MentionCandidate[] = [
            { userId: "u", name: "Zoë", email: null },
        ];
        expect(resolveMentionedUserIds("hi @Zoë", unicode)).toEqual(["u"]);
    });
});
