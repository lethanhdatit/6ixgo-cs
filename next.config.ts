import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  // Static export for GitHub Pages
  output: 'export',
  
  // Base path for GitHub Pages (change to your repo name)
  basePath: isProd ? '/6ixgo-cs' : '',
  
  // Asset prefix for GitHub Pages
  assetPrefix: isProd ? '/6ixgo-cs/' : '',
  
  // Trailing slash for static hosting compatibility
  trailingSlash: true,
  
  // Image optimization - disabled for static export
  images: {
    unoptimized: true,
  },
  
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
