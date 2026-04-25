import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // better-sqlite3 is already auto-opted-out by Next.js, but we include its
  // native binding explicitly so the standalone build copies it.
  outputFileTracingIncludes: {
    "/*": ["./node_modules/better-sqlite3/build/**/*"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "avatars.steamstatic.com" },
    ],
    minimumCacheTTL: 86400,
  },
  async headers() {
    return [
      {
        source: "/",
        headers: [
          {
            key: "Cache-Control",
            // s-maxage=300: Cloudflare caches for 5 minutes
            // stale-while-revalidate=300: serve stale for 5 minutes while revalidating
            // stale-if-error=86400: serve stale for 24 hours if origin is down
            value:
              "public, s-maxage=300, stale-while-revalidate=300, stale-if-error=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
