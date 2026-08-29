/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.cloudinary.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: '**.wikimedia.org' },
      { protocol: 'https', hostname: 'cdn.simpleicons.org' },
      { protocol: 'https', hostname: '**.simpleicons.org' },
      { protocol: 'https', hostname: 'assets.vercel.com' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: '**.googleusercontent.com' },
      { protocol: 'https', hostname: 'cdn.sanity.io' },
      { protocol: 'https', hostname: '**.sanity.io' },
      { protocol: 'https', hostname: 'cryptologos.cc' },
      { protocol: 'https', hostname: 'github.githubassets.com' },
      { protocol: 'https', hostname: 'a0.awsstatic.com' },
      { protocol: 'https', hostname: '**.awsstatic.com' },
      { protocol: 'https', hostname: 'supabase.com' },
      { protocol: 'https', hostname: 'razorpay.com' },
      { protocol: 'https', hostname: 'about.canva.com' },
      { protocol: 'https', hostname: 'www.gstatic.com' },
      { protocol: 'https', hostname: '**.gstatic.com' },
      { protocol: 'https', hostname: 'www.google.com' },
      { protocol: 'https', hostname: 'google.com' },
      { protocol: 'https', hostname: '**.google.com' },
    ],
  },
  async headers() {
    return [
      {
        // Immutable cache for sprite sheets, low-res frames & gallery assets — 1 year, no revalidation
        source: '/sequence/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/gallery/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=604800' },
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
