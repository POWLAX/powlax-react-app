/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['powlax.com', 'vimeo.com'],
  },
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig