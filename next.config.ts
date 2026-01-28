import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',

  images: {
    domains: ["your-image-domain.com"],
    formats: ["image/avif", "image/webp"],
  },
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    styledComponents: true,
  },
};

export default nextConfig