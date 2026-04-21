import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
