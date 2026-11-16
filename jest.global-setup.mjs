// Date formatting is asserted in tests; pin the zone before any worker starts
// (workers inherit the environment).
export default function globalSetup() {
    process.env.TZ = "UTC";
}
