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
  // Add environment variables that should be available on the client
  env: {
    NEXT_PUBLIC_SEQ1_API_URL: process.env.SEQ1_API_URL || "https://api.seq1.net",
  },
  // Add headers for CORS
  async headers() {
    return [
      {
        source: "/.well-known/nostr.json",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Content-Type", value: "application/json" },
        ],
      },
    ]
  },
}

export default nextConfig
