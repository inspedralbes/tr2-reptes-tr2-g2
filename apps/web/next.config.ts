import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 
  images: {
    unoptimized: true, 
  },
  transpilePackages: ["@enginy/shared", "@enginy/ui"],
};

export default nextConfig;