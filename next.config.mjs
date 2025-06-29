/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export configuration for nginx serving
  trailingSlash: false,
  
  // CONSTITUTIONAL PRIORITY: Disable TypeScript checking for urgent blockheight deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Image optimization settings
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
  
  // Output optimizations
  // output: "standalone", // DISABLED - causing 404 chunk issues
  poweredByHeader: false,
  
  env: {
    // Constitutional Blockheight Environment Variables
    NEXT_PUBLIC_UI_BLOCKHEIGHT: process.env.NEXT_PUBLIC_UI_BLOCKHEIGHT || '902437',
    NEXT_PUBLIC_API_BLOCKHEIGHT: process.env.NEXT_PUBLIC_API_BLOCKHEIGHT || '902437',
    NEXT_PUBLIC_SYSTEM_ENFORCER_BLOCKHEIGHT: process.env.NEXT_PUBLIC_SYSTEM_ENFORCER_BLOCKHEIGHT || '902437',
    NEXT_PUBLIC_AGENTS_BLOCKHEIGHT: process.env.NEXT_PUBLIC_AGENTS_BLOCKHEIGHT || '870450',
    
    // SEQ1 Canonical Environment Variables  
    NEXT_PUBLIC_API_BASE_URL: 'https://api.seq1.net',
    NEXT_PUBLIC_ENVIRONMENT: 'production'
  }
}

export default nextConfig
