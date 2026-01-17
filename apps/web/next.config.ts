import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', 
  images: {
    unoptimized: true, 
  },
  transpilePackages: ["@iter/shared", "@iter/ui"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://api:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;