/** @type {import("next").NextConfig} */
const nextConfig = {
  output: "standalone",
  trailingSlash: false,
  compress: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig
