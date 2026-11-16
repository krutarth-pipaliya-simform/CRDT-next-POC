import nodemailer from "nodemailer";

let testAccount: nodemailer.TestAccount | null = null;

async function getTransporter() {
    if (globalThis.nodemailerTransporter)
        return globalThis.nodemailerTransporter;

    if (process.env.EMAIL_SERVER_HOST) {
        globalThis.nodemailerTransporter = nodemailer.createTransport({
            host: process.env.EMAIL_SERVER_HOST,
            port: parseInt(process.env.EMAIL_SERVER_PORT || "587"),
            auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
            },
        });
        return globalThis.nodemailerTransporter;
    }

    // Fallback to Ethereal for testing
    if (!testAccount) {
        testAccount = await nodemailer.createTestAccount();
    }

    globalThis.nodemailerTransporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    return globalThis.nodemailerTransporter;
}

export async function sendVerificationEmail(
    email: string,
    token: string,
    appUrl: string,
) {
    const transporter = await getTransporter();
    const verifyUrl = `${appUrl}/verify-email?token=${token}`;

    const info = await transporter.sendMail({
        from: '"CRDT Next POC" <noreply@crdtnext.com>',
        to: email,
        subject: "Verify your email address",
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Welcome to CRDT Next POC!</h2>
                <p>Please verify your email address by clicking the button below:</p>
                <div style="margin: 20px 0;">
                    <a href="${verifyUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Verify Email Address
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${verifyUrl}">${verifyUrl}</a></p>
                <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            </div>
        `,
    });

    if (
        process.env.NODE_ENV !== "production" &&
        !process.env.EMAIL_SERVER_HOST
    ) {
        console.log(
            "📨 Test email sent! Preview URL: %s",
            nodemailer.getTestMessageUrl(info),
        );
    }
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
    const transporter = await getTransporter();

    const info = await transporter.sendMail({
        from: '"CRDT Next POC" <noreply@crdtnext.com>',
        to: email,
        subject: "Reset your password",
        html: `
            <div style="font-family: sans-serif; padding: 20px;">
                <h2>Reset your password</h2>
                <p>Someone asked to reset the password for this account. If it was you, choose a new one below:</p>
                <div style="margin: 20px 0;">
                    <a href="${resetUrl}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                        Choose a new password
                    </a>
                </div>
                <p>Or copy and paste this link into your browser:</p>
                <p><a href="${resetUrl}">${resetUrl}</a></p>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour and works once. If you did not ask for it, ignore this email: your password stays the same.</p>
            </div>
        `,
    });

    if (
        process.env.NODE_ENV !== "production" &&
        !process.env.EMAIL_SERVER_HOST
    ) {
        console.log(
            "📨 Test email sent! Preview URL: %s",
            nodemailer.getTestMessageUrl(info),
        );
    }
}
