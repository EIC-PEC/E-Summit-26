/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: 'assets.vercel.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
  async headers() {
    return [
      {
        // Immutable cache for sprite sheets and low-res frames — 1 year, no revalidation
        source: '/sequence/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
        ],
      },
    ]
  },
  async redirects() {
    return [
      { source: '/schedule', destination: '/#schedule', permanent: true },
      { source: '/speakers', destination: '/#speakers', permanent: true },
      { source: '/sponsors', destination: '/#sponsors', permanent: true },
      { source: '/faq', destination: '/#faq', permanent: true },
      { source: '/portfolio', destination: '/#event-portfolio', permanent: true },
      { source: '/tracks', destination: '/#event-portfolio', permanent: true },
      { source: '/passes', destination: '/register', permanent: true },
    ]
  },
  // Allow Three.js to work without SSR issues

  webpack: (config) => {
    config.externals = [...(config.externals || [])];
    return config;
  },
}

module.exports = nextConfig
