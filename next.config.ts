// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Permite ser embebido por Directus
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self' https://academy.ouhnou.technology",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
