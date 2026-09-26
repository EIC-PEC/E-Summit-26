'use client';
import React from 'react';
import { ZoomParallax } from "@/components/ui/zoom-parallax";

export default function ZoomParallaxSection() {

	// Assuming Lenis is already initialized at the app level
	// If not, it can be initialized here, but usually it's in layout.tsx or a global provider in this app.

	const images = [
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412309/esummit/gallery/pec_centenary_hall.png',
			alt: 'Centenary Hall & Lecture Arena',
		},
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412303/esummit/gallery/pec_aerial_night.png',
			alt: 'Campus Aerial Illumination at Night',
		},
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412313/esummit/gallery/pec_group.png',
			alt: 'Summit Delegates & Student Gathering',
		},
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412306/esummit/gallery/pec_auditorium.png',
			alt: 'Auditorium Inauguration & Keynote Stage',
		},
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412333/esummit/gallery/pec_startup_fair.png',
			alt: 'Startup Exhibition & Career Expo',
		},
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412317/esummit/gallery/pec_innovation_stage.png',
			alt: 'Innovation Stage & Prototype Demos',
		},
		{
			src: 'https://res.cloudinary.com/dxtvq5s2x/image/upload/v1787412336/esummit/gallery/pec_team.png',
			alt: 'Organizing Committee & Leadership Team',
		},
	];

	return (
		<section className="relative w-full text-white overflow-hidden" style={{ backgroundColor: 'var(--bg-section-2)' }}>
			{/* 1. Light Green Variable Gradient Background */}
			<div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-section-1)] via-[var(--bg-panel-alt)] to-[var(--bg-section-2)] opacity-80" />
			
			{/* 2. Stronger Ambient Mint Glows for lighter feel */}
			<div className="absolute top-0 left-1/4 h-[800px] w-[800px] rounded-full bg-[var(--accent-mint)]/20 blur-[150px] pointer-events-none" />
			<div className="absolute bottom-0 right-1/4 h-[800px] w-[800px] rounded-full bg-[var(--accent-green)]/15 blur-[150px] pointer-events-none" />
			
			{/* 3. Film Grain Texture */}
			<div className="absolute inset-0 opacity-[0.05] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")' }} />

			<div className="relative flex h-[30vh] items-center justify-center z-10">
				<div className="text-center relative z-10">
					<h2
						className="font-display font-black uppercase leading-none tracking-wider text-center select-none"
						style={{ fontSize: 'clamp(2rem, 5vw, 4rem)' }}
					>
						<span className="text-gradient-mint">GLIMPSES</span>
					</h2>
					<p className="mt-4 font-mono-data text-xs sm:text-sm font-bold uppercase tracking-wider text-gray-400">
						Scroll down to explore past memories
					</p>
				</div>
			</div>
			
			<ZoomParallax images={images} />
		</section>
	);
}
