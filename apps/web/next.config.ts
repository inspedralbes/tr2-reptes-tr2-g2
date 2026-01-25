import type { NextConfig } from "next";

const isElectronBuild = process.env.IS_ELECTRON_BUILD === 'true';

const nextConfig: NextConfig = {
  output: isElectronBuild ? 'export' : 'standalone',
  images: {
    unoptimized: true,
  },
  transpilePackages: ["@iter/shared", "@iter/ui"],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3000/api/:path*',
      },
    ];
  },
};

export default nextConfig;