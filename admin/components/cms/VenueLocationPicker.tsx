'use client';

import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface VenueLocationPickerProps {
  lat: number;
  lng: number;
  venueName?: string;
  building?: string;
  onChange: (coords: { lat: number; lng: number; venueName?: string; building?: string }) => void;
}

const PEC_LANDMARKS = [
  { name: 'Main Auditorium', building: 'CCA Building', lat: 30.765515, lng: 76.784260 },
  { name: 'Senate Hall', building: 'PEC Senate Hall', lat: 30.767000, lng: 76.787200 },
  { name: 'Siemens CoE', building: 'Siemens Center of Excellence', lat: 30.768200, lng: 76.789000 },
  { name: 'Expo Hall', building: 'SPIC Centre', lat: 30.765833, lng: 76.785850 },
  { name: 'Main Gate (Gate 1)', building: 'Campus Entrance', lat: 30.763153, lng: 76.783675 },
  { name: 'Student Center', building: 'PEC Market Area', lat: 30.766326, lng: 76.783485 },
  { name: 'Open Air Theatre', building: 'OAT Arena', lat: 30.766200, lng: 76.787500 },
];

export function VenueLocationPicker({
  lat,
  lng,
  venueName,
  building,
  onChange,
}: VenueLocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const currentLat = lat || 30.765515;
  const currentLng = lng || 76.784260;

  // Load Leaflet CSS and Script dynamically if not present
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!document.getElementById('leaflet-css')) {
      const link = document.createElement('link');
      link.id = 'leaflet-css';
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    if (!(window as any).L) {
      const script = document.createElement('script');
      script.id = 'leaflet-script';
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.async = true;
      script.onload = () => setIsMapReady(true);
      document.head.appendChild(script);
    } else {
      setIsMapReady(true);
    }
  }, []);

  // Initialize Map
  useEffect(() => {
    if (!isMapReady || !mapContainerRef.current || mapInstanceRef.current) return;

    const L = (window as any).L;
    if (!L) return;

    const isLight = document.documentElement.classList.contains('light');
    const tileUrl = isLight
      ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const map = L.map(mapContainerRef.current, {
      center: [currentLat, currentLng],
      zoom: 16,
      zoomControl: true,
      attributionControl: false,
    });

    L.tileLayer(tileUrl, {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(map);

    // Custom Glowing Marker Icon
    const customIcon = L.divIcon({
      className: 'custom-venue-pin',
      html: `
        <div style="
          position: relative;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: #10B981;
            opacity: 0.35;
            animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
          "></div>
          <div style="
            position: relative;
            width: 14px;
            height: 14px;
            border-radius: 50%;
            background: #10B981;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 2px 8px rgba(0,0,0,0.5);
          "></div>
        </div>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 14],
    });

    // Create Draggable Marker
    const marker = L.marker([currentLat, currentLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    markerRef.current = marker;

    // Handle marker drag
    marker.on('dragend', () => {
      const position = marker.getLatLng();
      onChange({
        lat: Number(position.lat.toFixed(6)),
        lng: Number(position.lng.toFixed(6)),
      });
    });

    // Handle map click to place pin
    map.on('click', (e: any) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      onChange({
        lat: Number(clickLat.toFixed(6)),
        lng: Number(clickLng.toFixed(6)),
      });
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isMapReady]);

  // Update marker position if props change externally
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([currentLat, currentLng]);
    }
  }, [currentLat, currentLng]);

  const selectLandmark = (lm: typeof PEC_LANDMARKS[0]) => {
    onChange({
      lat: lm.lat,
      lng: lm.lng,
      venueName: lm.name,
      building: lm.building,
    });
    if (mapInstanceRef.current && markerRef.current) {
      markerRef.current.setLatLng([lm.lat, lm.lng]);
      mapInstanceRef.current.panTo([lm.lat, lm.lng], { animate: true, duration: 0.5 });
    }
  };

  return (
    <div className="space-y-3">
      {/* Header Info */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-(--text-primary) flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-emerald-500" />
          <span>Location &amp; Coordinates</span>
        </label>
        <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-(--bg-panel-alt) px-2 py-0.5 rounded-[4px] border border-(--border-subtle)">
          {currentLat.toFixed(5)}, {currentLng.toFixed(5)}
        </span>
      </div>

      {/* Quick Select Preset Buttons */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-(--text-muted) flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-emerald-500" /> Quick Select Campus Venue:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {PEC_LANDMARKS.map((lm) => {
            const isSelected = Math.abs(lm.lat - currentLat) < 0.0001 && Math.abs(lm.lng - currentLng) < 0.0001;
            return (
              <button
                key={lm.name}
                type="button"
                onClick={() => selectLandmark(lm)}
                className={`rounded-[4px] px-2.5 py-1 text-[11px] font-bold transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                    : 'bg-(--bg-panel-alt) text-(--text-muted) hover:text-(--text-primary) border-(--border-subtle) hover:border-(--border-panel)'
                }`}
              >
                {lm.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Leaflet Map Container */}
      <div className="relative overflow-hidden rounded-[4px] border border-(--border-panel) bg-(--bg-panel-alt) shadow-sm">
        <div ref={mapContainerRef} className="h-56 w-full z-0 cursor-crosshair" />
        <div className="absolute bottom-2 left-2 z-10 rounded-[4px] bg-(--bg-panel)/90 backdrop-blur-md px-2 py-1 text-[10px] font-bold text-(--text-primary) border border-(--border-subtle) shadow-sm flex items-center gap-1.5">
          <Navigation className="h-3 w-3 text-emerald-500" />
          <span>Click anywhere on map or drag pin to adjust</span>
        </div>
      </div>
    </div>
  );
}
