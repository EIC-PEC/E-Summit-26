const withPWA = require('@ducanh2912/next-pwa').default({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  publicExcludes: ['!sequence/**/*', '!gallery/**/*'],
});

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
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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

module.exports = withPWA(nextConfig)
