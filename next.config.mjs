/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['api.seq1.net', 'localhost'],
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Remove any environment variable mapping
  // We'll use server-side environment variables directly
  experimental: {
    serverActions: true,
  },
}

export default nextConfig
