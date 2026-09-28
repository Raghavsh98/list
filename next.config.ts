import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // The agent-readable twins. /raghav/films.json and .md are the same document,
    // served by one route handler; the pretty URL stays in the address bar.
    return [
      { source: "/:handle/:slug\\.json", destination: "/api/twin/json/:handle/:slug" },
      { source: "/:handle/:slug\\.md", destination: "/api/twin/md/:handle/:slug" },
    ];
  },
};

export default nextConfig;
