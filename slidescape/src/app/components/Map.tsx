'use client';

import { GoogleMap, useJsApiLoader, Polygon, GroundOverlay } from '@react-google-maps/api';
import { useCallback, useState, useEffect, useMemo, useRef} from 'react';
import type { Libraries } from '@react-google-maps/api';


const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = {
  lat: 0,
  lng: 0,
};

const libraries: Libraries = ['places'];

const amazonCenter = { lat: -4.5, lng: -63 };

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
  zoom = 2.8,
}: MapViewProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [year, setYear] = useState(2008);
  const [imagesLoaded, setImagesLoaded] = useState(true);
  const [forestClicked, setForestClicked] = useState(false);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const defaultViewRef = useRef<{ center: google.maps.LatLngLiteral; zoom: number } | null>(null);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    defaultViewRef.current = {
      center: map.getCenter()?.toJSON() || defaultCenter,
      zoom: map.getZoom() || zoom
    }
  }, []);

  const mapOptions = useMemo(() => ({
    tilt: 45,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: 'satellite' as const,
    minZoom: 2.8,
    maxZoom: 2.8,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    zoomControl: false,
    gestureHandling: 'none',
    restriction: {
      latLngBounds: {
        north: 80,
        south: -60,
        west: -179.9, 
        east: 179.9
      },
      strictBounds: true
    }

  }), []);



  const handleAmazonClick = () => {
    if (mapInstance) {
      // Temporarily remove map restrictions & zoom for navigation
      mapInstance.setOptions({ restriction: undefined, maxZoom: 5 });
      
      //Set bounds for Amazon
      const bounds = new google.maps.LatLngBounds();
      amazonRainforestCoords.forEach((coord) => {
        bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
      });

      //Navigate to Amazon
      mapInstance.fitBounds(bounds);
      mapInstance.setZoom(5);

      //Lock user in place
      mapInstance.setOptions({
      draggable: false,
      scrollwheel: false,
      disableDoubleClickZoom: true,
      zoomControl: false,
      minZoom: 5,
      maxZoom: 5,
      });


      // Set forest variable to true after clicked
      setTimeout(() => {
        setForestClicked(true);
      }, 200);
    }
  };

  const handleBack= () => {
    if (mapInstance && defaultViewRef.current) {
      setForestClicked(false);
      mapInstance.setOptions(mapOptions);
      mapInstance.setCenter(defaultViewRef.current.center);
      mapInstance.setZoom(defaultViewRef.current.zoom);
    }
  }

  /*useEffect(() => {
  const suffixes = ['NW', 'NE', 'SW', 'SE'];
  let loadedCount = 0;
  let errored = false;

  setImagesLoaded(false); // Reset before loading new year

  suffixes.forEach((suffix) => {
    const img = new Image();
    img.src = `/hansen-forest-images/full_map_${year}_${suffix}.png`;

    img.onload = () => {
      loadedCount += 1;
      if (loadedCount === suffixes.length && !errored) {
        setImagesLoaded(true);
      }
    };

    img.onerror = () => {
      //console.error(`❌ Failed to load image: /hansen-forest-images/full_map_${year}_${suffix}.png`);
      errored = true;
    };
  });
}, [year]);*/


  const amazonPolygonOptions = {
    fillColor: isHovered ? '#ff590040' : '#ff7b0020',
    fillOpacity: 0.3,
    strokeColor: '#aa3e00ff',
    strokeOpacity: 0.8,
    strokeWeight: 2,
  };

  if (loadError) return <div>Map failed to load</div>;
  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <div className="relative w-full h-screen">
      <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={zoom}
      options={mapOptions}
      onLoad={onLoad}
      >
        <Polygon
          paths={amazonRainforestCoords}
          options={amazonPolygonOptions}
          onClick={handleAmazonClick}
        />
  <>
    <GroundOverlay
      key={`overlay-${year}-NW`}
      url={`/hansen-forest-images/full_map_${year}_NW.png`}
      bounds={{ north: 80, south: 0, west: -180, east: 0 }}
      opacity={1}
    />
    <GroundOverlay
      key={`overlay-${year}-NE`}
      url={`/hansen-forest-images/full_map_${year}_NE.png`}
      bounds={{ north: 80, south: 0, west: 0, east: 180 }}
      opacity={1}
    />
    <GroundOverlay
      key={`overlay-${year}-SW`}
      url={`/hansen-forest-images/full_map_${year}_SW.png`}
      bounds={{ north: 0, south: -60, west: -180, east: 0 }}
      opacity={1}
    />
    <GroundOverlay
      key={`overlay-${year}-SE`}
      url={`/hansen-forest-images/full_map_${year}_SE.png`}
      bounds={{ north: 0, south: -60, west: 0, east: 180 }}
      opacity={1}
    />
    </>
      </GoogleMap>
      {/* Optional year slider UI */}
      <div className="absolute bottom-10 left-1/8 transform -translate-x-1/2 w-[320px] z-50 bg-black/60 p-4 rounded-xl shadow-lg border border-gray-700">
        <div className="flex justify-between items-center text-white text-sm mb-2">
          <span>Year</span>
          <span className="font-mono">{year}</span>
        </div>
        <input
          type="range"
          min={2000}
          max={2024}
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
            background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(year - 2000) / (2024 - 2000) * 100}%, #2e2e2e ${(year - 2000) / (2024 - 2000) * 100}%, #2e2e2e 100%)`,
          }}
        />
      </div>
      {forestClicked && (
      <button
        className="absolute top-5 left-5 z-50 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
        onClick={handleBack}
      >
        ← Back
      </button>
    )}
    
    {/*!forestClicked && (
      <Polygon
        center={amazonCenter}
      />
        
    )

    */}
    </div>
  );
}
