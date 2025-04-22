import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    domains: [],
    remotePatterns: [],
    unoptimized: true,
  },
  webpack: (config: any) => {
    config.resolve = {
      ...config.resolve,
      fallback: { 
        ...config.resolve?.fallback,
        fs: false 
      }
    };
    return config;
  },
}

export default nextConfig;
