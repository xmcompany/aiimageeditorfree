import withBundleAnalyzer from '@next/bundle-analyzer';
import { createMDX } from 'fumadocs-mdx/next';
import createNextIntlPlugin from 'next-intl/plugin';

const withMDX = createMDX();
const withNextIntl = createNextIntlPlugin('./src/core/i18n/request.ts');
const analyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.VERCEL ? undefined : 'standalone',
  reactStrictMode: false,
  pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: [
    '@libsql/client',
    '@libsql/isomorphic-ws',
  ],
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@swc/core-darwin-arm64',
      'node_modules/@swc/core-darwin-x64',
      'node_modules/@swc/core-win32-x64-msvc',
      'node_modules/typescript/**',
      'node_modules/eslint/**',
      'node_modules/prettier/**',
      // Giant rendering libraries - safe to exclude from server worker
      'node_modules/shiki/**',
      'node_modules/@shikijs/**',
      'node_modules/mermaid/**',
      'node_modules/@tabler/icons-react/**',
    ],
  },
  async headers() {
    return [
      {
        // Allow OAuth popups to retain window.opener after cross-origin navigation
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
  experimental: {
    mdxRs: true,
    optimizePackageImports: [
      'lucide-react',
      'react-icons/ri',
      'react-icons/lu',
      'react-icons/hi2',
      'react-icons/io5',
      'react-icons/go',
      'recharts'
    ],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};

export default analyzer(withNextIntl(withMDX(nextConfig)));
