/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    // SEQ1 Canonical Environment Variables (3 only - as per master plan)
    NEXT_PUBLIC_API_BASE_URL: 'https://seq1-api-prod.fly.dev',
    NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: '899285',
    NEXT_PUBLIC_ENVIRONMENT: 'production'
  }
}

export default nextConfig