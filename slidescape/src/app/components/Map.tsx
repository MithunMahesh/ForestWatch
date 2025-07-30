'use client';

import {
  GoogleMap,
  useJsApiLoader,
  Polygon,
  GroundOverlay,
  Marker,
  InfoWindow,
} from '@react-google-maps/api';
import { useCallback, useState, useEffect, useMemo, useRef } from 'react';
import type { Libraries } from '@react-google-maps/api';

const containerStyle = {
  width: '100%',
  height: '100vh',
};

const defaultCenter = { lat: 0, lng: 0 };
const libraries: Libraries = ['places'];

// Forest Centers (removed Congo, Madagascar, Canadian, Cerrado)
const amazonCenter = { lat: -4.5, lng: -63 };
const southeastAsianCenter = { lat: -2.5, lng: 118.0 };
const centralAmericanCenter = { lat: 14.0, lng: -87.0 };
const siberianCenter = { lat: 62.0, lng: 95.0 };
const easternUSCenter = { lat: 38.0, lng: -80.0 };
const westernUSCenter = { lat: 45.0, lng: -122.0 };

// Forest Coordinates (removed Congo, Madagascar, Canadian, Cerrado)
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

const southeastAsianCoords = [
  { lat: 8.0, lng: 95.0 },
  { lat: 6.0, lng: 125.0 },
  { lat: -2.0, lng: 137.0 },
  { lat: -6.0, lng: 135.0 },
  { lat: -10.0, lng: 115.0 },
  { lat: -8.0, lng: 100.0 },
  { lat: -2.0, lng: 95.0 },
  { lat: 8.0, lng: 95.0 },
];

const centralAmericanCoords = [
  { lat: 17.5, lng: -102.5 },  
  { lat: 21.0, lng:  -87.5 }, 
  { lat: 12.0, lng:  -77 }, 
  { lat: 6.5, lng:  -75.0 },  
  { lat:  5.0, lng:  -89.0 },
  { lat: 11.5, lng:  -96.0 },  
  { lat: 14.5, lng: -100.0 }, 
];



const siberianCoords = [
  { lat: 50.0, lng: 60.0 },
  { lat: 70.0, lng: 60.0 },
  { lat: 70.0, lng: 170.0 },
  { lat: 50.0, lng: 170.0 },
  { lat: 50.0, lng: 60.0 },
];

const easternUSCoords = [
  { lat: 47.0, lng: -95.0 },
  { lat: 45.0, lng: -68.0 },
  { lat: 33.0, lng: -70.0 },
  { lat: 25.0, lng: -80.0 },
  { lat: 30.0, lng: -95.0 },
  { lat: 47.0, lng: -95.0 },
];

const westernUSCoords = [
  { lat: 49.0, lng: -125.0 },
  { lat: 49.0, lng: -116.0 },
  { lat: 45.0, lng: -114.0 },
  { lat: 38.5, lng: -110.0 },
  { lat: 35.5, lng: -117.0 },
  { lat: 38.5, lng: -124.0 },
  { lat: 42.5, lng: -124.0 },
];


type MapViewProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
};

export default function MapView({
  center = defaultCenter,
  zoom = 2.8,
}: MapViewProps) {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [year, setYear] = useState(2008);
  const [rawYear, setRawYear] = useState(2008);
  
  // Individual states for remaining forests
  const [amazonForestClicked, setAmazonForestClicked] = useState(false);
  const [southeastAsianForestClicked, setSoutheastAsianForestClicked] = useState(false);
  const [centralAmericanForestClicked, setCentralAmericanForestClicked] = useState(false);
  const [siberianForestClicked, setSiberianForestClicked] = useState(false);
  const [easternUSForestClicked, setEasternUSForestClicked] = useState(false);
  const [westernUSForestClicked, setWesternUSForestClicked] = useState(false);
  
  const [loadClicked, setLoadClicked] = useState(false);
  
  // Individual border load states
  const [amazonBorderLoad, setAmazonBorderLoad] = useState(false);
  const [southeastAsianBorderLoad, setSoutheastAsianBorderLoad] = useState(false);
  const [centralAmericanBorderLoad, setCentralAmericanBorderLoad] = useState(false);
  const [siberianBorderLoad, setSiberianBorderLoad] = useState(false);
  const [easternUSBorderLoad, setEasternUSBorderLoad] = useState(false);
  const [westernUSBorderLoad, setWesternUSBorderLoad] = useState(false);
  
  // Individual info states
  const [amazonInfoOpen, setAmazonInfoOpen] = useState(false);
  const [southeastAsianInfoOpen, setSoutheastAsianInfoOpen] = useState(false);
  const [centralAmericanInfoOpen, setCentralAmericanInfoOpen] = useState(false);
  const [siberianInfoOpen, setSiberianInfoOpen] = useState(false);
  const [easternUSInfoOpen, setEasternUSInfoOpen] = useState(false);
  const [westernUSInfoOpen, setWesternUSInfoOpen] = useState(false);

  const defaultViewRef = useRef<{ center: google.maps.LatLngLiteral; zoom: number } | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rawYear !== year) {
        setYear(rawYear);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawYear, year]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    defaultViewRef.current = {
      center: map.getCenter()?.toJSON() || defaultCenter,
      zoom: map.getZoom() || zoom,
    };
  }, [zoom]);

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
        east: 179.9,
      },
      strictBounds: true,
    },
  }), []);

  // Check if any forest is clicked
  const anyForestClicked = amazonForestClicked || southeastAsianForestClicked || 
    centralAmericanForestClicked || siberianForestClicked || 
    easternUSForestClicked || westernUSForestClicked;

  // Generic click handler
  const createForestClickHandler = (coords: any[], setForestClicked: any, setInfoOpen: any, setBorderLoad: any) => {
    return () => {
      if (mapInstance) {
        mapInstance.setOptions({ restriction: undefined, maxZoom: 5 });

        const bounds = new google.maps.LatLngBounds();
        coords.forEach((coord) => {
          bounds.extend(coord);
        });

        mapInstance.fitBounds(bounds);
        mapInstance.setZoom(5);

        mapInstance.setOptions({
          draggable: false,
          scrollwheel: false,
          disableDoubleClickZoom: true,
          zoomControl: false,
          minZoom: 5,
          maxZoom: 5,
        });

        setTimeout(() => {
          setForestClicked(true);
          setInfoOpen(false);
          setBorderLoad(true);
        }, 200);
      }
    };
  };

  // Individual click handlers
  const handleAmazonClick = createForestClickHandler(amazonRainforestCoords, setAmazonForestClicked, setAmazonInfoOpen, setAmazonBorderLoad);
  const handleSoutheastAsianClick = createForestClickHandler(southeastAsianCoords, setSoutheastAsianForestClicked, setSoutheastAsianInfoOpen, setSoutheastAsianBorderLoad);
  const handleCentralAmericanClick = createForestClickHandler(centralAmericanCoords, setCentralAmericanForestClicked, setCentralAmericanInfoOpen, setCentralAmericanBorderLoad);
  const handleSiberianClick = createForestClickHandler(siberianCoords, setSiberianForestClicked, setSiberianInfoOpen, setSiberianBorderLoad);
  const handleEasternUSClick = createForestClickHandler(easternUSCoords, setEasternUSForestClicked, setEasternUSInfoOpen, setEasternUSBorderLoad);
  const handleWesternUSClick = createForestClickHandler(westernUSCoords, setWesternUSForestClicked, setWesternUSInfoOpen, setWesternUSBorderLoad);

  const handleBack = () => {
    if (mapInstance && defaultViewRef.current) {
      // Reset all forest states
      setAmazonForestClicked(false);
      setSoutheastAsianForestClicked(false);
      setCentralAmericanForestClicked(false);
      setSiberianForestClicked(false);
      setEasternUSForestClicked(false);
      setWesternUSForestClicked(false);
      
      setLoadClicked(true);
      
      // Reset all border loads
      setAmazonBorderLoad(false);
      setSoutheastAsianBorderLoad(false);
      setCentralAmericanBorderLoad(false);
      setSiberianBorderLoad(false);
      setEasternUSBorderLoad(false);
      setWesternUSBorderLoad(false);

      setTimeout(() => {
        mapInstance.setOptions(mapOptions);
        mapInstance.setCenter(defaultViewRef.current!.center);
        mapInstance.setZoom(defaultViewRef.current!.zoom);

        setTimeout(() => {
          setLoadClicked(false);
        }, 500);
      }, 400);
    }
  };

  const forestPolygonOptions = {
    fillColor: '#ff7b0020',
    fillOpacity: 0.3,
    strokeColor: '#aa3e00ff',
    strokeOpacity: 0.8,
    strokeWeight: 2,
  };

  // Create info card component
  const createInfoCard = (center: any, infoOpen: boolean, setInfoOpen: any, onClick: any, title: string) => {
    return !anyForestClicked && infoOpen && (
      <>
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setInfoOpen(false)}
        />
        <div 
          className="absolute z-50 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-3 w-[140px]"
          style={{
            left: `${((center.lng + 170) / 360) * 100}%`,
            top: `${((105 - center.lat) / 180) * 100}%`,
            transform: 'translate(-50%, -100%)',
            marginTop: '-60px'
          }}
        >
          <div className="text-sm text-black font-semibold mb-2">
            {title}
          </div>
          <button
            onClick={onClick}
            className="bg-green-500 text-black px-3 py-1 rounded text-xs font-medium hover:bg-green-600 transition w-full"
          >
            Zoom In
          </button>
        </div>
      </>
    );
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
        {/* Polygons */}
        {amazonBorderLoad && (
          <Polygon paths={amazonRainforestCoords} options={forestPolygonOptions} onClick={handleAmazonClick} />
        )}
        {southeastAsianBorderLoad && (
          <Polygon paths={southeastAsianCoords} options={forestPolygonOptions} onClick={handleSoutheastAsianClick} />
        )}
        {centralAmericanBorderLoad && (
          <Polygon paths={centralAmericanCoords} options={forestPolygonOptions} onClick={handleCentralAmericanClick} />
        )}
        {siberianBorderLoad && (
          <Polygon paths={siberianCoords} options={forestPolygonOptions} onClick={handleSiberianClick} />
        )}
        {easternUSBorderLoad && (
          <Polygon paths={easternUSCoords} options={forestPolygonOptions} onClick={handleEasternUSClick} />
        )}
        {westernUSBorderLoad && (
          <Polygon paths={westernUSCoords} options={forestPolygonOptions} onClick={handleWesternUSClick} />
        )}

        {/* Markers */}
        {!anyForestClicked && (
          <>
            <Marker position={amazonCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setAmazonInfoOpen(true)} />
            <Marker position={southeastAsianCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setSoutheastAsianInfoOpen(true)} />
            <Marker position={centralAmericanCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setCentralAmericanInfoOpen(true)} />
            <Marker position={siberianCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setSiberianInfoOpen(true)} />
            <Marker position={easternUSCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setEasternUSInfoOpen(true)} />
            <Marker position={westernUSCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setWesternUSInfoOpen(true)} />
          </>
        )}

        {/* Info Cards */}
        {createInfoCard(amazonCenter, amazonInfoOpen, setAmazonInfoOpen, handleAmazonClick, "Amazon Rainforest")}
        {createInfoCard(southeastAsianCenter, southeastAsianInfoOpen, setSoutheastAsianInfoOpen, handleSoutheastAsianClick, "Southeast Asian Forest")}
        {createInfoCard(centralAmericanCenter, centralAmericanInfoOpen, setCentralAmericanInfoOpen, handleCentralAmericanClick, "Central American Forest")}
        {createInfoCard(siberianCenter, siberianInfoOpen, setSiberianInfoOpen, handleSiberianClick, "Siberian Taiga")}
        {createInfoCard(easternUSCenter, easternUSInfoOpen, setEasternUSInfoOpen, handleEasternUSClick, "Eastern US Forest")}
        {createInfoCard(westernUSCenter, westernUSInfoOpen, setWesternUSInfoOpen, handleWesternUSClick, "Western US Forest")}

        {/* Ground overlays */}
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

      {/* Year slider */}
      {anyForestClicked && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[320px] z-50 bg-black/60 p-4 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center text-white text-sm mb-2">
            <span>Year</span>
            <span className="font-mono">{year}</span>
          </div>
          <input
            type="range"
            min={2000}
            max={2024}
            step={1}
            value={rawYear}
            onChange={(e) => setRawYear(parseInt(e.target.value))}
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
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(rawYear - 2000) / 24 * 100}%, #2e2e2e ${(rawYear - 2000) / 24 * 100}%, #2e2e2e 100%)`,
            }}
          />
        </div>
      )}

      {loadClicked && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black">
          <svg
            className="h-12 w-12 animate-spin text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 50 50"
            fill="none"
          >
            <circle
              className="opacity-100"
              cx="25"
              cy="25"
              r="20"
              stroke="currentColor"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="100"
              strokeDashoffset="60"
            />
          </svg>
        </div>
      )}

      {/* Back button */}
      {anyForestClicked && (
        <button
          className="absolute top-5 left-5 z-50 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          onClick={handleBack}
        >
          ← Back
        </button>
      )}
    </div>
  );
}