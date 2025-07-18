'use client';

import { GoogleMap, useJsApiLoader, Polygon } from '@react-google-maps/api';
import { useCallback, useState } from 'react';
import type { Libraries } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 0, 
  lng: -30,
};

// Define the libraries array outside the component to prevent re-renders
const libraries: Libraries = ['places'];

// Amazon rainforest boundary coordinates (simplified outline)
const amazonRainforestCoords = [
  { lat: 5.2, lng: -60.0 },   // Northern Venezuela/Guyana
  { lat: 4.0, lng: -52.0 },   // Northern Brazil/French Guiana
  { lat: 2.0, lng: -50.0 },   // Northern Brazil
  { lat: -2.0, lng: -48.0 },  // Eastern Brazil
  { lat: -8.0, lng: -50.0 },  // Central Brazil
  { lat: -12.0, lng: -55.0 }, // Southern Brazil
  { lat: -15.0, lng: -60.0 }, // Bolivia border
  { lat: -13.0, lng: -65.0 }, // Bolivia
  { lat: -10.0, lng: -70.0 }, // Peru
  { lat: -5.0, lng: -75.0 },  // Peru/Colombia
  { lat: 1.0, lng: -72.0 },   // Colombia
  { lat: 3.0, lng: -67.0 },   // Venezuela
  { lat: 5.2, lng: -60.0 },   // Back to start
];

type MapViewProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
};

export default function MapView({
  center = defaultCenter,
  zoom = 3,
}: MapViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  // Handle map load
  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  // Memoize the map options to prevent unnecessary re-renders
  const mapOptions = useCallback(() => ({
    tilt: 45,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: 'satellite' as const,
  }), []);

  // Amazon polygon options
  const amazonPolygonOptions = {
    fillColor: isHovered ? '#ff590040' : '#ff7b0020', // Green with transparency
    fillOpacity: 0.3,
    strokeColor: '#aa3e00ff',
    strokeOpacity: 0.8,
    strokeWeight: 2,
  };

  // Handle Amazon rainforest click
  const handleAmazonClick = () => {
    console.log('Amazon Rainforest clicked!');
    
    // Zoom in to fit the rainforest on screen with more zoom
    if (mapInstance) {
      // Calculate bounds to fit the Amazon polygon
      const bounds = new google.maps.LatLngBounds();
      amazonRainforestCoords.forEach(coord => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });
      
      // Fit the map to show the entire rainforest
      mapInstance.fitBounds(bounds);
      
      // Add extra zoom after fitBounds
      setTimeout(() => {
        const currentZoom = mapInstance.getZoom();
        if (currentZoom) {
          mapInstance.setZoom(currentZoom + 1); // Add 2 more zoom levels
        }
      }, 100);
    }
  };

  // Handle mouse events for hover effect
  const handleAmazonMouseOver = () => {
    setIsHovered(true);
  };

  const handleAmazonMouseOut = () => {
    setIsHovered(false);
  };

  if (loadError) return <div>Map failed to load </div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="relative w-full h-screen">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions()}
        onLoad={onLoad}
      >
        {/* Amazon Rainforest Polygon */}
        <Polygon
          paths={amazonRainforestCoords}
          options={amazonPolygonOptions}
          onClick={handleAmazonClick}
          onMouseOver={handleAmazonMouseOver}
          onMouseOut={handleAmazonMouseOut}
        />
      </GoogleMap>
    </div>
  );
}