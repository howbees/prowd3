/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Images configuration for external domains
  images: {
    domains: ['example.com'], // Replace with your image domains
  },

  // Environment variables (set your CUSTOM_API_URL in .env if needed)
  env: {
    CUSTOM_API_URL: process.env.CUSTOM_API_URL || '', // Set a fallback or define it in your .env file
  },

  // Webpack customizations (if any)
  webpack: (config, { isServer }) => {
    // Example: Adding custom webpack configurations for server-side or client-side builds
    if (!isServer) {
      config.resolve.fallback = { fs: false };
    }
    return config;
  },

  // Redirects (Optional)
  async redirects() {
    return [
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true,
      },
    ];
  },

  // Rewrites (Optional)
  async rewrites() {
    return [
      {
        source: '/old-route',
        destination: '/new-route',
      },
    ];
  },

  // Headers (Optional)
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

  // Custom page extensions (Optional)
  pageExtensions: ['jsx', 'js', 'ts', 'tsx'],
};

module.exports = nextConfig;
