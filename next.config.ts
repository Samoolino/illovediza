import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    "/api/municipalities": ["./data/spain/municipalities/**/*.json"],
    "/api/sports-network": ["./data/spain/sports-venues.json"]
  },
};

export default nextConfig;
