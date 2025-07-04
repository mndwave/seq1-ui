/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: '903942',
    NEXT_PUBLIC_API_URL: 'https://api.seq1.net',
    NEXT_PUBLIC_DEPLOYMENT_TIMESTAMP: '2025-07-04T08:01:29.025298',
    NEXT_PUBLIC_DEPLOYMENT_ID: 'vercel_1751616078'
  },
  reactStrictMode: true,
  experimental: {
    appDir: true
  }
}

module.exports = nextConfig
