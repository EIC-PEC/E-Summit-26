'use client'

import React, { useState, useEffect, useRef } from 'react'
import Image, { ImageProps } from 'next/image'

interface BlurImageProps extends ImageProps {
  wrapperClassName?: string
}

/**
 * Big-Tech Style Progressive Blur Image Loader
 * Gracefully handles layout sizing for both filled and fixed images,
 * ensuring cached images load instantly without staying hidden.
 */
export default function BlurImage({
  src,
  alt,
  className = '',
  wrapperClassName = '',
  onLoad,
  style,
  fill,
  priority,
  ...props
}: BlurImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement | null>(null)

  // Ensure images load immediately if cached by browser
  useEffect(() => {
    if (imgRef.current?.complete) {
      setIsLoaded(true)
    }
  }, [src])

  const fillWrapperStyles = fill ? 'absolute inset-0 w-full h-full' : 'relative'

  return (
    <div
      className={`${fillWrapperStyles} overflow-hidden bg-[#0D1813] ${wrapperClassName}`.trim()}
      style={style}
    >
      {/* Dark sleek skeleton shimmer */}
      {!isLoaded && (
        <div className="absolute inset-0 z-10 animate-pulse bg-gradient-to-r from-white/[0.02] via-white/[0.07] to-white/[0.02] pointer-events-none" />
      )}
      <Image
        ref={imgRef}
        src={src}
        alt={alt}
        fill={fill}
        className={`transition-all duration-500 ease-out will-change-[opacity,transform] ${
          isLoaded
            ? 'scale-100 opacity-100'
            : 'scale-105 opacity-0'
        } ${className}`}
        onLoad={(e) => {
          setIsLoaded(true)
          if (onLoad) onLoad(e)
        }}
        priority={priority}
        {...props}
      />
    </div>
  )
}
