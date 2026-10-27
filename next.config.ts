import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  allowedDevOrigins: ["127.0.0.1"],
  agentRules: false,
};

export default nextConfig;
