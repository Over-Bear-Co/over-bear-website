import type { NextConfig } from "next";

/* Baseline security hardening. A strict Content-Security-Policy is intentionally NOT set here yet:
   the beforeInteractive inline boot script in layout.tsx would require a per-request nonce
   (see node_modules/next/dist/docs/01-app/02-guides/content-security-policy.md). Add that when the
   site ships with real endpoints. */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
