import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // App Router is enabled by default in Next.js 15
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  trailingSlash: false,
  // Ensure clean builds
  cleanDistDir: true,
};

export default nextConfig;
