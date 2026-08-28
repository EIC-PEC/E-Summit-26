'use client'

export default function imageLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
  // 1. Cloudinary optimization
  if (src.startsWith('https://res.cloudinary.com/')) {
    // Safely inject transformation parameters after /upload/
    const params = [
      'f_auto', // Auto-format (WebP/AVIF)
      `w_${width}`, // Resize to exact requested width
      `q_${quality || 'auto'}`, // Auto-quality or requested quality
      'c_limit', // Limit size, don't crop or upscale unnecessarily
    ]
    return src.replace('/upload/', `/upload/${params.join(',')}/`)
  }

  // 2. Unsplash optimization (used in Alumni section)
  if (src.startsWith('https://images.unsplash.com/')) {
    const url = new URL(src)
    url.searchParams.set('w', width.toString())
    url.searchParams.set('q', (quality || 'auto').toString())
    url.searchParams.set('auto', 'format')
    url.searchParams.set('fit', 'max')
    return url.toString()
  }

  // 3. Fallback for local images or other domains (served as-is)
  return src
}
