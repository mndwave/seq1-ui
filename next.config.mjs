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
  
  // Production build optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle analyzer and tree shaking optimizations
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  
  // Webpack optimizations for smaller bundles
  webpack: (config, { isServer, dev }) => {
    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      }
    }
    
    // Exclude heavy server-side dependencies from client bundle
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        crypto: false,
      }
    }
    
    return config
  },
  
  // Output optimizations
  output: 'standalone',
  poweredByHeader: false,
  
  env: {
    // SEQ1 Canonical Environment Variables (3 only - as per master plan)
    NEXT_PUBLIC_API_BASE_URL: 'https://api.seq1.net',
    NEXT_PUBLIC_BITCOIN_BLOCKHEIGHT: '899285',
    NEXT_PUBLIC_ENVIRONMENT: 'production'
  }
}

export default nextConfig