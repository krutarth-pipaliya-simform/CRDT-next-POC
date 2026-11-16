import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs/config";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: "https",
                hostname: "lh3.googleusercontent.com",
                pathname: "/**",
            },
            {
                protocol: "https",
                hostname: "avatars.githubusercontent.com",
                pathname: "/**",
            },
        ],
    },
    experimental: {
        serverActions: {
            // Uploads go through Server Actions; the largest is a chat file
            // (CHAT_ATTACHMENT_MAX_BYTES, 8 MB) plus multipart overhead.
            bodySizeLimit: "9mb",
        },
    },
    // Required to allow other devices on LAN to use the dev server properly
    allowedDevOrigins: ["172.16.6.126"],
};

const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

// Sentry build options. Without SENTRY_AUTH_TOKEN (every local build) no
// source maps are uploaded and nothing about the build changes; the tunnel
// route only exists when a DSN is configured.
export default withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.CI,
    telemetry: false,
    sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
    widenClientFileUpload: true,
    // Sends browser events through our own origin so ad blockers do not drop
    // them. `src/proxy.ts` excludes this path from its login redirect.
    tunnelRoute: sentryDsn ? "/monitoring" : undefined,
});
