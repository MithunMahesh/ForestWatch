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

const libraries: Libraries = ['places'];

const amazonRainforestCoords = [
  { lat: 5.2, lng: -60.0 },
  { lat: 4.0, lng: -52.0 },
  { lat: 2.0, lng: -50.0 },
  { lat: -2.0, lng: -48.0 },
  { lat: -8.0, lng: -50.0 },
  { lat: -12.0, lng: -55.0 },
  { lat: -15.0, lng: -60.0 },
  { lat: -13.0, lng: -65.0 },
  { lat: -10.0, lng: -70.0 },
  { lat: -5.0, lng: -75.0 },
  { lat: 1.0, lng: -72.0 },
  { lat: 3.0, lng: -67.0 },
  { lat: 5.2, lng: -60.0 },
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
  const [year, setYear] = useState(2000); 

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
  }, []);

  const mapOptions = useCallback(
    () => ({
      tilt: 45,
      fullscreenControl: false,
      streetViewControl: false,
      mapTypeControl: false,
      mapTypeId: 'satellite' as const,
    }),
    []
  );

  const amazonPolygonOptions = {
    fillColor: isHovered ? '#ff590040' : '#ff7b0020',
    fillOpacity: 0.3,
    strokeColor: '#aa3e00ff',
    strokeOpacity: 0.8,
    strokeWeight: 2,
  };

  const handleAmazonClick = () => {
    console.log('Amazon Rainforest clicked!');
    if (mapInstance) {
      const bounds = new google.maps.LatLngBounds();
      amazonRainforestCoords.forEach((coord) => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });

      mapInstance.fitBounds(bounds);
      setTimeout(() => {
        const currentZoom = mapInstance.getZoom();
        if (currentZoom) {
          mapInstance.setZoom(currentZoom + 1);
        }
      }, 100);
    }
  };

  const handleAmazonMouseOver = () => setIsHovered(true);
  const handleAmazonMouseOut = () => setIsHovered(false);

  if (loadError) return <div>Map failed to load</div>;
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
        <Polygon
          paths={amazonRainforestCoords}
          options={amazonPolygonOptions}
          onClick={handleAmazonClick}
          onMouseOver={handleAmazonMouseOver}
          onMouseOut={handleAmazonMouseOut}
        />
      </GoogleMap>

      <div className="absolute bottom-10 left-1/9 transform -translate-x-1/2 w-[320px] z-50 bg-black/60 p-4 rounded-xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center text-white text-sm mb-2">
          <span>Year</span>
          <span className="font-mono">{year}</span>
        </div>
        <input
          type="range"
          min={1970}
          max={2025}
          step={1}
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full h-2 appearance-none rounded-lg cursor-pointer
                    accent-blue-500
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-black
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-blue-500
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-moz-range-thumb]:appearance-none"
          style={{
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(year - 1970) / (2025 - 1970) * 100}%, #2e2e2e ${(year - 1970) / (2025 - 1970) * 100}%, #2e2e2e 100%)`,
          }}
        />
      </div>
    </div>
  );
}
