import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['example.com'], // Add your real domains here
  },

  env: {
    CUSTOM_API_URL: process.env.CUSTOM_API_URL || '',
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },

  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};

export default nextConfig;
