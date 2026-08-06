/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  // Vercel deployment - use serverless
  output: 'standalone',
  webpack: (config, { isServer }) => {
    if (isServer) {
      const original = config.externals;
      const externalsArray = Array.isArray(original) ? original : original ? [original] : [];
      // External packages that need to stay as require
      config.externals = [
        ...externalsArray,
        ({ request }, callback) => {
          if (
            request === '@electric-sql/pglite' ||
            request?.startsWith('@electric-sql/pglite/') ||
            request === 'drizzle-orm/pglite' ||
            request === 'drizzle-orm/postgres-js' ||
            request === 'postgres'
          ) {
            return callback(null, 'commonjs ' + request);
          }
          callback();
        },
      ];
    }
    return config;
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

module.exports = nextConfig;
