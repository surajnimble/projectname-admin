import type { NextConfig } from 'next';

const API_BASE_URL = (process.env.API_BASE_URL ?? 'https://projectname-api.vercel.app').replace(/\/+$/, '');
const API_PREFIX = process.env.NEXT_PUBLIC_API_PREFIX ?? '/api/v1';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async rewrites() {
    return [{ source: `${API_PREFIX}/:path*`, destination: `${API_BASE_URL}${API_PREFIX}/:path*` }];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        ],
      },
    ];
  },
};

export default nextConfig;

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
initOpenNextCloudflareForDev();
