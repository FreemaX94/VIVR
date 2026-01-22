/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    // Optimize image formats
    formats: ['image/avif', 'image/webp'],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  // Compiler optimizations
  compiler: {
    // Remove console.log in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Experimental optimizations
  experimental: {
    // Optimize package imports (tree-shaking)
    optimizePackageImports: ['lucide-react', '@heroicons/react'],
  },
  // PoweredBy header removal for security
  poweredByHeader: false,
  // Compress responses
  compress: true,
  // Generate ETags for caching
  generateEtags: true,
}

module.exports = nextConfig
