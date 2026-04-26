'use client';
// ============================================================
// LOCATION PICKER COMPONENT (Leaflet Map)
// ============================================================
// An interactive map where the customer can pin their exact
// delivery location by dragging a marker.
//
// This component uses Leaflet + React-Leaflet.
// It is ONLY imported dynamically (no SSR) because Leaflet
// uses browser-specific APIs (window, document, navigator).
//
// HOW IT WORKS:
// 1. Map loads centered on a default location
// 2. Customer can drag the marker to their exact location
// 3. We use reverse geocoding (Nominatim free API) to get
//    the address from the GPS coordinates
// 4. The parent component receives lat, lng, and address
//
// !! CHANGE DEFAULT CENTER !! to your city's coordinates
// Find coordinates: https://www.latlong.net/
// ============================================================

import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Locate, MapPin } from 'lucide-react';

// Fix Leaflet's default marker icon paths
// This is a known issue with Leaflet in webpack/Next.js
// The default icons use relative paths that don't work with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create a custom orange marker icon to match our brand
// !! CHANGE THE COLOR if you want a different marker !!
const customIcon = new L.DivIcon({
  html: `
    <div style="
      width: 36px; 
      height: 36px; 
      background: #f77f17; 
      border: 3px solid white; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(247,127,23,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 36],   // Bottom center of the pin
  popupAnchor: [0, -36],
});

interface LocationData {
  lat: number;
  lng: number;
  address: string;
}

interface LocationPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLat?: number;
  initialLng?: number;
}

// !! CHANGE THESE to your city's approximate center !!
// Default center coordinates (New York City)
// Find your coordinates at: https://www.latlong.net/
const DEFAULT_LAT = 40.7128;
const DEFAULT_LNG = -74.0060;
const DEFAULT_ZOOM = 13;

// Component that handles map click and marker drag events
function MapEventHandler({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (lat: number, lng: number) => void;
}) {
  // Listen to map click events to move the marker
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return (
    <Marker
      position={position}
      icon={customIcon}
      draggable={true}
      eventHandlers={{
        dragend(e) {
          const marker = e.target;
          const pos = marker.getLatLng();
          onPositionChange(pos.lat, pos.lng);
        },
      }}
    />
  );
}

export function LocationPicker({
  onLocationSelect,
  initialLat,
  initialLng,
}: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat || DEFAULT_LAT,
    initialLng || DEFAULT_LNG,
  ]);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [mapKey, setMapKey] = useState(0); // Used to remount map when needed

  // Reverse geocode: convert lat/lng to human-readable address
  // Uses OpenStreetMap's Nominatim API (free, no API key needed)
  // !! You can replace this with Google Maps Geocoding API for better results !!
  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { 'Accept-Language': 'en' } }  // Get results in English
      );
      const data = await response.json();
      
      // Build a readable address from the Nominatim response
      const parts = [
        data.address?.road,
        data.address?.house_number,
        data.address?.suburb,
        data.address?.city || data.address?.town || data.address?.village,
        data.address?.country,
      ].filter(Boolean);
      
      return parts.join(', ') || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      // If geocoding fails, just return coordinates
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  // When position changes, reverse geocode and notify parent
  const handlePositionChange = useCallback(async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    const address = await reverseGeocode(lat, lng);
    onLocationSelect({ lat, lng, address });
  }, [reverseGeocode, onLocationSelect]);

  // Get user's current GPS location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    
    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        await handlePositionChange(lat, lng);
        setIsGettingLocation(false);
        // Remount map to update center to new position
        setMapKey(k => k + 1);
      },
      (error) => {
        console.error('Geolocation error:', error);
        setIsGettingLocation(false);
        alert('Could not get your location. Please pin it manually on the map.');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="space-y-3">
      {/* Current location button */}
      <button
        type="button"
        onClick={handleGetCurrentLocation}
        disabled={isGettingLocation}
        className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-sm font-medium transition-colors disabled:opacity-60"
      >
        <Locate className={`w-4 h-4 ${isGettingLocation ? 'animate-spin' : ''}`} />
        {isGettingLocation ? 'Getting location...' : 'Use My Current Location'}
      </button>

      {/* Map container */}
      <div className="relative rounded-2xl overflow-hidden border border-border" style={{ height: '300px' }}>
        
        {/* Instruction overlay */}
        <div className="absolute top-3 left-3 right-3 z-[1000] pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground shadow-card">
            <MapPin className="w-3 h-3 text-primary-500 flex-shrink-0" />
            Click on the map or drag the pin to set your delivery location
          </div>
        </div>

        {/* The actual Leaflet map */}
        <MapContainer
          key={mapKey}
          center={position}
          zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          {/* OpenStreetMap tiles (free, no API key required) */}
          {/* !! You can replace with Google Maps tiles (needs API key) !! */}
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Draggable marker */}
          <MapEventHandler
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>
      
      {/* Coordinates display */}
      <p className="text-xs text-muted-foreground text-center">
        📍 {position[0].toFixed(5)}, {position[1].toFixed(5)}
      </p>
    </div>
  );
}
