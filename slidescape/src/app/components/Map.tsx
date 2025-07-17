'use client';

import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import { useCallback } from 'react';
import type { Libraries } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: -3.4653, // Amazon region
  lng: -62.2159,
};

// Define the libraries array outside the component to prevent re-renders
const libraries: Libraries = ['places'];

type MapViewProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
};

export default function MapView({
  center = defaultCenter,
  zoom = 6,
}: MapViewProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.API || '',
    libraries,
  });

  // Memoize the map options to prevent unnecessary re-renders
  const mapOptions = useCallback(() => ({
    tilt: 45,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: 'satellite' as const,
  }), []);

  if (loadError) return <div>Map failed to load 😢</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions()}
    />
  );
}