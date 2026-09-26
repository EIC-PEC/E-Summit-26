import React from 'react'

interface PageBannerProps {
  title: string
  subtitle?: string
}

export default function PageBanner({ title, subtitle }: PageBannerProps) {
  return (
    <div className="relative w-full min-h-[300px] sm:min-h-[350px] bg-[#0A1813] overflow-hidden flex flex-col items-center justify-center pt-24 sm:pt-28 pb-12">
      {/* Dynamic Background Patterns & Light Green Shades */}
      <div className="absolute inset-0 z-0 bg-[#07130F]">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#00F2B2]/15 via-[#0A1813]/60 to-[#00B8FF]/10" />
        
        {/* Glow Orbs - Blue and Green Mix */}
        <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[150%] bg-[#00F2B2]/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[130%] bg-[#00B8FF]/20 blur-[130px] rounded-full pointer-events-none mix-blend-screen" />
        <div className="absolute bottom-[-30%] left-[20%] w-[40%] h-[100%] bg-[#00F2B2]/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

        {/* Grain / Noise Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }}
        />
        
        {/* Abstract Cyber grid overlay */}
        <div 
          className="absolute inset-0 opacity-10 mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%2300F2B2' fill-opacity='0.4'%3E%3Cpath opacity='.5' d='M96 95h4v1h-4v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4h-9v4h-1v-4H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15v-9H0v-1h15V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h9V0h1v15h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9h4v1h-4v9zm-1 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm9-10v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-10 0v-9h-9v9h9zm-9-10h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9zm10 0h9v-9h-9v9z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-8 lg:px-12 text-center flex flex-col items-center">
        <h1
          className="font-display font-black uppercase leading-tight tracking-wider select-none"
          style={{ fontSize: 'clamp(2rem, 6vw, 4.5rem)' }}
        >
          <span className="text-gradient-mint">{title}</span>
        </h1>
        {subtitle && (
          <p className="mt-2 font-mono-data text-xs sm:text-sm font-bold uppercase tracking-wider text-white">
            {subtitle}
          </p>
        )}
      </div>

      {/* Fade into section background color at the bottom */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-section-1 to-transparent z-10" />
    </div>
  )
}
