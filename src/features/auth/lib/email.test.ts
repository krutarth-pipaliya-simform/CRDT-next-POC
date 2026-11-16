import nodemailer from "nodemailer";

import {
    sendPasswordResetEmail,
    sendVerificationEmail,
} from "@/features/auth/lib/email";

jest.mock("nodemailer", () => {
    const sendMail = jest.fn();
    return {
        __esModule: true,
        default: {
            createTransport: jest.fn(() => ({ sendMail })),
            createTestAccount: jest.fn(),
            getTestMessageUrl: jest.fn(() => "https://preview.example/1"),
        },
    };
});

const mockNodemailer = jest.mocked(nodemailer);
// Every transport the mock hands out shares this one `sendMail`.
const sendMail = jest.mocked(nodemailer.createTransport({}).sendMail);

beforeEach(() => {
    globalThis.nodemailerTransporter = undefined;
    delete process.env.EMAIL_SERVER_HOST;
    sendMail.mockResolvedValue({
        messageId: "m1",
        envelope: { from: false, to: [] },
        accepted: [],
        rejected: [],
        pending: [],
        response: "250 OK",
    });
    mockNodemailer.createTestAccount.mockResolvedValue({
        user: "ethereal-user",
        pass: "ethereal-pass",
        smtp: { host: "smtp.ethereal.email", port: 587, secure: false },
        imap: { host: "", port: 0, secure: false },
        pop3: { host: "", port: 0, secure: false },
        web: "",
    });
    jest.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.EMAIL_SERVER_HOST;
});

describe("sendVerificationEmail", () => {
    it("sends a link built from the app URL and token", async () => {
        await sendVerificationEmail("a@b.co", "tok", "https://app.example.com");

        const message = sendMail.mock.calls[0]?.[0];
        expect(message.to).toBe("a@b.co");
        expect(message.subject).toBe("Verify your email address");
        expect(message.html).toContain(
            "https://app.example.com/verify-email?token=tok",
        );
        // First send in this module: no SMTP host, so a test account is made.
        expect(mockNodemailer.createTestAccount).toHaveBeenCalledTimes(1);
    });

    it("falls back to Ethereal, reusing its test account, and logs the preview in dev", async () => {
        await sendVerificationEmail("a@b.co", "tok", "http://localhost:3000");

        expect(mockNodemailer.createTestAccount).not.toHaveBeenCalled();
        expect(mockNodemailer.createTransport).toHaveBeenCalledWith(
            expect.objectContaining({
                host: "smtp.ethereal.email",
                auth: { user: "ethereal-user", pass: "ethereal-pass" },
            }),
        );
        expect(console.log).toHaveBeenCalled();
    });

    it("uses the configured SMTP server and reuses the transporter", async () => {
        process.env.EMAIL_SERVER_HOST = "smtp.example.com";
        process.env.EMAIL_SERVER_PORT = "2525";

        await sendVerificationEmail("a@b.co", "tok", "https://x.test");
        await sendVerificationEmail("c@d.co", "tok2", "https://x.test");

        expect(mockNodemailer.createTransport).toHaveBeenCalledTimes(1);
        expect(mockNodemailer.createTransport).toHaveBeenCalledWith(
            expect.objectContaining({ host: "smtp.example.com", port: 2525 }),
        );
        expect(mockNodemailer.createTestAccount).not.toHaveBeenCalled();
        expect(console.log).not.toHaveBeenCalled();
        delete process.env.EMAIL_SERVER_PORT;
    });

    it("defaults the SMTP port to 587", async () => {
        process.env.EMAIL_SERVER_HOST = "smtp.example.com";
        await sendVerificationEmail("a@b.co", "tok", "https://x.test");
        expect(mockNodemailer.createTransport).toHaveBeenCalledWith(
            expect.objectContaining({ port: 587 }),
        );
    });
});

describe("sendPasswordResetEmail", () => {
    it("sends the reset link it was given", async () => {
        await sendPasswordResetEmail("a@b.co", "https://x.test/reset?t=1");

        const message = sendMail.mock.calls[0]?.[0];
        expect(message.subject).toBe("Reset your password");
        expect(message.html).toContain("https://x.test/reset?t=1");
        expect(console.log).toHaveBeenCalled();
    });

    it("stays quiet about preview links with a real SMTP server", async () => {
        process.env.EMAIL_SERVER_HOST = "smtp.example.com";
        await sendPasswordResetEmail("a@b.co", "https://x.test/reset?t=1");
        expect(console.log).not.toHaveBeenCalled();
    });
});
