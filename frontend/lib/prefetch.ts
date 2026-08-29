// lib/prefetch.ts
// Speculative pre-loader for checkout scripts and critical route resources

let hasPreloadedRazorpay = false

export function prefetchRegister() {
  if (typeof window === 'undefined' || hasPreloadedRazorpay) return

  hasPreloadedRazorpay = true

  // Speculatively preload Razorpay checkout script into browser cache
  try {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'script'
    link.href = 'https://checkout.razorpay.com/v1/checkout.js'
    document.head.appendChild(link)
  } catch (_) {
    // Non-critical optimization
  }
}
