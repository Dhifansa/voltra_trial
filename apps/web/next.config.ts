import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@voltra/contracts', '@voltra/energy-calc'],
};

export default nextConfig;
