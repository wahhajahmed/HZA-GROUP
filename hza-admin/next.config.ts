import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // On Vercel, output .next to the repo root so @vercel/next can find it
  ...(process.env.VERCEL ? { distDir: '../.next' } : {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
};

export default nextConfig;
