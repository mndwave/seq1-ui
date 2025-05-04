/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Keep the rewrites for the API route
  async rewrites() {
    return [
      {
        source: '/.well-known/nostr.json',
        destination: '/api/nostr'
      }
    ]
  },
  // Keep the headers for direct file access as fallback
  async headers() {
    return [
      {
        source: "/.well-known/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
          { key: "Content-Type", value: "application/json; charset=utf-8" }
        ]
      }
    ]
  }
};

export default nextConfig;
