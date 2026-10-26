import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    '169.254.222.33',
    '169.254.222.33:3001',
    '169.254.222.33:3000',
    'localhost',
    'localhost:3001',
    'localhost:3000',
    '127.0.0.1',
    '127.0.0.1:3001',
    '127.0.0.1:3000',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
