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

const amazonCenter = { lat: -4.5, lng: -63 };
const southeastAsianCenter = { lat: -2.5, lng: 118.0 };
const centralAmericanCenter = { lat: 14.0, lng: -87.0 };
const siberianCenter = { lat: 52.0, lng: 100.0 };
const easternUSCenter = { lat: 36.0, lng: -72.0 };
const westernUSCenter = { lat: 45.0, lng: -122.0 };
const canadianBorealCenter = { lat: 50.0, lng: -100.0 };
const chineseTemperateCenter = { lat: 25.5, lng: 112.0 };
const eastEuropeanTaigaCenter = { lat: 51.0, lng: 50.0 };

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
  { lat: 59.0, lng: 73.0 },  
  { lat: 63.0, lng: 95.0 },  
  { lat: 61.0, lng: 125.0 }, 
  { lat: 51.0, lng: 128.0 },  
  { lat: 41.0, lng: 122.0 },  
  { lat: 40.0, lng: 95.0 },  
  { lat: 47.0, lng: 75.0 }, 
];

const easternUSCoords = [
  { lat: 45.0, lng: -70.0 },
  { lat: 42.0, lng: -57.0 },
  { lat: 35.0, lng: -70.0 },
  { lat: 27.0, lng: -80.0 },
  { lat: 37.0, lng: -85.0 },
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

const canadianBorealCoords = [
  { lat: 58.0, lng: -123.0 },
  { lat: 55.0, lng: -100.0 },
  { lat: 50.0, lng: -80.0 },
  { lat: 45.0, lng: -80.0 },
  { lat: 42.0, lng: -100.0 },
  { lat: 48.0, lng: -120.0 },
];

const chineseTemperateCoords = [
  { lat: 31.0, lng: 103.0 },
  { lat: 31.0, lng: 120.0 },
  { lat: 24.0, lng: 122.0 },
  { lat: 18.0, lng: 115.0 },
  { lat: 21.0, lng: 105.0 },
  { lat: 25.0, lng: 102.0 },
];

const eastEuropeanTaigaCoords = [
  { lat: 55.0, lng:  30.0 },
  { lat: 57.0, lng:  60.0 },
  { lat: 50.0, lng:  70.0 },
  { lat: 45.0, lng:  60.0 },
  { lat: 45.0, lng:  40.0 },
  { lat: 50.0, lng:  30.0 },
];

const forestNames = {
  amazon: 'Amazon Rainforest',
  southeastAsian: 'Southeast Asian Forest',
  centralAmerican: 'Mesoamerican Tropical Forests',
  siberian: 'Siberian Taiga',
  easternUS: 'Eastern Deciduous Forests',
  westernUS: 'Pacific Northwest Forests',
  canadianBoreal: 'Canadian Boreal Forest',
  chineseTemperate: 'Chinese Temperate Forests',
  eastEuropeanTaiga: 'East European Taiga',
} as const;

type ForestKey = keyof typeof forestNames;

interface DeforestationData {
  deforestation_area_km2: number;
  carbon_loss_tonnes: number;
  cumulative_deforestation_km2: number;
  yearly_change_percent: number;
  cool_facts: string[];
  short_summary: string;
}

type MapViewProps = {
  center?: { lat: number; lng: number };
  zoom?: number;
};

export default function MapView({
  center = defaultCenter,
  zoom = 3,
}: MapViewProps) {
  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL LOGIC
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyBmvbZOaiCP7xRKsL4p3AJkP3hhsoyTyNs",
    libraries,
  });

  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [year, setYear] = useState(2008);
  const [rawYear, setRawYear] = useState(2008);
  
  const [amazonForestClicked, setAmazonForestClicked] = useState(false);
  const [southeastAsianForestClicked, setSoutheastAsianForestClicked] = useState(false);
  const [centralAmericanForestClicked, setCentralAmericanForestClicked] = useState(false);
  const [siberianForestClicked, setSiberianForestClicked] = useState(false);
  const [easternUSForestClicked, setEasternUSForestClicked] = useState(false);
  const [westernUSForestClicked, setWesternUSForestClicked] = useState(false);
  const [canadianBorealForestClicked, setCanadianBorealForestClicked] = useState(false);
  const [chineseTemperateForestClicked, setChineseTemperateForestClicked] = useState(false);
  const [eastEuropeanTaigaForestClicked, setEastEuropeanTaigaForestClicked] = useState(false);
  
  const [loadClicked, setLoadClicked] = useState(false);
  
  const [amazonBorderLoad, setAmazonBorderLoad] = useState(false);
  const [southeastAsianBorderLoad, setSoutheastAsianBorderLoad] = useState(false);
  const [centralAmericanBorderLoad, setCentralAmericanBorderLoad] = useState(false);
  const [siberianBorderLoad, setSiberianBorderLoad] = useState(false);
  const [easternUSBorderLoad, setEasternUSBorderLoad] = useState(false);
  const [westernUSBorderLoad, setWesternUSBorderLoad] = useState(false);
  const [canadianBorealBorderLoad, setCanadianBorealBorderLoad] = useState(false);
  const [chineseTemperateBorderLoad, setChineseTemperateBorderLoad] = useState(false);
  const [eastEuropeanTaigaBorderLoad, setEastEuropeanTaigaBorderLoad] = useState(false);
  
  const [amazonInfoOpen, setAmazonInfoOpen] = useState(false);
  const [southeastAsianInfoOpen, setSoutheastAsianInfoOpen] = useState(false);
  const [centralAmericanInfoOpen, setCentralAmericanInfoOpen] = useState(false);
  const [siberianInfoOpen, setSiberianInfoOpen] = useState(false);
  const [easternUSInfoOpen, setEasternUSInfoOpen] = useState(false);
  const [westernUSInfoOpen, setWesternUSInfoOpen] = useState(false);
  const [canadianBorealInfoOpen, setCanadianBorealInfoOpen] = useState(false);
  const [chineseTemperateInfoOpen, setChineseTemperateInfoOpen] = useState(false);
  const [eastEuropeanTaigaInfoOpen, setEastEuropeanTaigaInfoOpen] = useState(false);

  const [deforestationData, setDeforestationData] = useState<DeforestationData | null>(null);
  const [currentForest, setCurrentForest] = useState<ForestKey | ''>('');
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [showStats, setShowStats] = useState(false);

  const defaultViewRef = useRef<{ center: google.maps.LatLngLiteral; zoom: number } | null>(null);

  // Computed values using useMemo
  const anyForestClicked = useMemo(() => {
    return amazonForestClicked || southeastAsianForestClicked || 
      centralAmericanForestClicked || siberianForestClicked || 
      easternUSForestClicked || westernUSForestClicked ||
      canadianBorealForestClicked || chineseTemperateForestClicked ||
      eastEuropeanTaigaForestClicked;
  }, [amazonForestClicked, southeastAsianForestClicked, centralAmericanForestClicked, 
      siberianForestClicked, easternUSForestClicked, westernUSForestClicked,
      canadianBorealForestClicked, chineseTemperateForestClicked, eastEuropeanTaigaForestClicked]);

  const mapOptions = useMemo(() => ({
    tilt: 45,
    fullscreenControl: false,
    streetViewControl: false,
    mapTypeControl: false,
    mapTypeId: 'satellite' as const,
    minZoom: 3,
    maxZoom: 3,
    draggable: false,
    scrollwheel: false,
    disableDoubleClickZoom: true,
    zoomControl: false,
    gestureHandling: 'none',
    restriction: {
      latLngBounds: {
        north: 80,
        south: -45,
        west: -179.9,
        east: 179.9,
      },
      strictBounds: true,
    },
  }), []);

  // useEffect hooks
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (rawYear !== year) {
        setYear(rawYear);
        if (currentForest && anyForestClicked) {
          fetchDeforestationData(currentForest, rawYear);
        }
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [rawYear, year, currentForest, anyForestClicked]);

  // useCallback hooks
  const onLoad = useCallback((map: google.maps.Map) => {
    setMapInstance(map);
    defaultViewRef.current = {
      center: map.getCenter()?.toJSON() || defaultCenter,
      zoom: map.getZoom() || zoom,
    };
  }, [zoom]);

  const fetchDeforestationData = useCallback(async (forest: string, selectedYear: number) => {
    setIsLoadingData(true);
    try {
      const response = await fetch(`/api/summary?forest=${forest}&year=${selectedYear}`);
      if (response.ok) {
        const data = await response.json();
        setDeforestationData(data);
        setShowStats(true);
      } else {
        console.error('Failed to fetch deforestation data');
      }
    } catch (error) {
      console.error('Error fetching deforestation data:', error);
    } finally {
      setIsLoadingData(false);
    }
  }, []);

  const createForestClickHandler = useCallback((coords: any[], setForestClicked: any, setInfoOpen: any, setBorderLoad: any, forestKey: ForestKey) => {
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

        setLoadClicked(true);

        setTimeout(() => {
          setForestClicked(true);
          setInfoOpen(false);
          setBorderLoad(true);
          setCurrentForest(forestKey);
          fetchDeforestationData(forestKey, year);
          setTimeout(() => {
            setLoadClicked(false);
          }, 150);
        }, 200);
      }
    };
  }, [mapInstance, fetchDeforestationData, year]);

  const handleAmazonClick = useMemo(() => createForestClickHandler(amazonRainforestCoords, setAmazonForestClicked, setAmazonInfoOpen, setAmazonBorderLoad, 'amazon'), [createForestClickHandler]);
  const handleSoutheastAsianClick = useMemo(() => createForestClickHandler(southeastAsianCoords, setSoutheastAsianForestClicked, setSoutheastAsianInfoOpen, setSoutheastAsianBorderLoad, 'southeastAsian'), [createForestClickHandler]);
  const handleCentralAmericanClick = useMemo(() => createForestClickHandler(centralAmericanCoords, setCentralAmericanForestClicked, setCentralAmericanInfoOpen, setCentralAmericanBorderLoad, 'centralAmerican'), [createForestClickHandler]);
  const handleSiberianClick = useMemo(() => createForestClickHandler(siberianCoords, setSiberianForestClicked, setSiberianInfoOpen, setSiberianBorderLoad, 'siberian'), [createForestClickHandler]);
  const handleEasternUSClick = useMemo(() => createForestClickHandler(easternUSCoords, setEasternUSForestClicked, setEasternUSInfoOpen, setEasternUSBorderLoad, 'easternUS'), [createForestClickHandler]);
  const handleWesternUSClick = useMemo(() => createForestClickHandler(westernUSCoords, setWesternUSForestClicked, setWesternUSInfoOpen, setWesternUSBorderLoad, 'westernUS'), [createForestClickHandler]);
  const handleCanadianBorealClick = useMemo(() => createForestClickHandler(canadianBorealCoords, setCanadianBorealForestClicked, setCanadianBorealInfoOpen, setCanadianBorealBorderLoad, 'canadianBoreal'), [createForestClickHandler]);
  const handleChineseTemperateClick = useMemo(() => createForestClickHandler(chineseTemperateCoords, setChineseTemperateForestClicked, setChineseTemperateInfoOpen, setChineseTemperateBorderLoad, 'chineseTemperate'), [createForestClickHandler]);
  const handleEastEuropeanTaigaClick = useMemo(() => createForestClickHandler(eastEuropeanTaigaCoords, setEastEuropeanTaigaForestClicked, setEastEuropeanTaigaInfoOpen, setEastEuropeanTaigaBorderLoad, 'eastEuropeanTaiga'), [createForestClickHandler]);

  const handleBack = useCallback(() => {
    if (mapInstance && defaultViewRef.current) {
      setAmazonForestClicked(false);
      setSoutheastAsianForestClicked(false);
      setCentralAmericanForestClicked(false);
      setSiberianForestClicked(false);
      setEasternUSForestClicked(false);
      setWesternUSForestClicked(false);
      setCanadianBorealForestClicked(false);
      setChineseTemperateForestClicked(false);
      setEastEuropeanTaigaForestClicked(false);
      
      setLoadClicked(true);
      setShowStats(false);
      setDeforestationData(null);
      setCurrentForest('');
      
      setAmazonBorderLoad(false);
      setSoutheastAsianBorderLoad(false);
      setCentralAmericanBorderLoad(false);
      setSiberianBorderLoad(false);
      setEasternUSBorderLoad(false);
      setWesternUSBorderLoad(false);
      setCanadianBorealBorderLoad(false);
      setChineseTemperateBorderLoad(false);
      setEastEuropeanTaigaBorderLoad(false);

      setTimeout(() => {
        mapInstance.setOptions(mapOptions);
        mapInstance.setCenter(defaultViewRef.current!.center);
        mapInstance.setZoom(defaultViewRef.current!.zoom);

        setTimeout(() => {
          setLoadClicked(false);
        }, 800);
      }, 600);
    }
  }, [mapInstance, mapOptions]);

  const createInfoCard = useCallback((center: any, infoOpen: boolean, setInfoOpen: any, onClick: any, title: string) => {
    if (!anyForestClicked && infoOpen && mapInstance) {
      const projection = mapInstance.getProjection();
      const bounds = mapInstance.getBounds();
      
      if (projection && bounds) {
        const latLng = new google.maps.LatLng(center.lat - 10, center.lng);
        const point = projection.fromLatLngToPoint(latLng);
        const topRight = projection.fromLatLngToPoint(bounds.getNorthEast());
        const bottomLeft = projection.fromLatLngToPoint(bounds.getSouthWest());
        
        if (point && topRight && bottomLeft) {
          const scale = Math.pow(2, mapInstance.getZoom()!);
          const worldPoint = new google.maps.Point(point.x * scale, point.y * scale);
          
          const container = mapInstance.getDiv();
          const containerBounds = container.getBoundingClientRect();
          
          const x = ((worldPoint.x - bottomLeft.x * scale) / ((topRight.x - bottomLeft.x) * scale)) * containerBounds.width;
          const y = ((worldPoint.y - topRight.y * scale) / ((bottomLeft.y - topRight.y) * scale)) * containerBounds.height;
          
          return (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setInfoOpen(false)}
              />
              <div 
                className="absolute z-50 bg-white rounded-lg shadow-lg border-2 border-gray-300 p-3 w-[140px]"
                style={{
                  left: `${x}px`,
                  top: `${y - 60}px`,
                  transform: 'translate(-50%, -100%)',
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
        }
      }
    }
    return null;
  }, [anyForestClicked, mapInstance]);

  const formatNumber = useCallback((num: number) => {
    return new Intl.NumberFormat().format(Math.round(num));
  }, []);

  // Add these logs
  console.log('isLoaded:', isLoaded);
  console.log('loadError:', loadError);

  // NOW handle conditional returns AFTER all hooks are called
  if (loadError) {
    console.error('Load error details:', loadError);
    return <div>Map failed to load: {loadError.message}</div>;
  }

  if (!isLoaded) {
    console.log('Still loading...');
    return <div>Loading map...</div>;
  }

  return (
    <div className="relative w-full h-screen">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
      >
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
        {canadianBorealBorderLoad && (
          <Polygon paths={canadianBorealCoords} options={forestPolygonOptions} onClick={handleCanadianBorealClick} />
        )}
        {chineseTemperateBorderLoad && (
          <Polygon paths={chineseTemperateCoords} options={forestPolygonOptions} onClick={handleChineseTemperateClick} />
        )}
        {eastEuropeanTaigaBorderLoad && (
          <Polygon paths={eastEuropeanTaigaCoords} options={forestPolygonOptions} onClick={handleEastEuropeanTaigaClick} />
        )}

        {!anyForestClicked && (
          <>
            <Marker position={amazonCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setAmazonInfoOpen(true)} />
            <Marker position={southeastAsianCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setSoutheastAsianInfoOpen(true)} />
            <Marker position={centralAmericanCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setCentralAmericanInfoOpen(true)} />
            <Marker position={siberianCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setSiberianInfoOpen(true)} />
            <Marker position={easternUSCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setEasternUSInfoOpen(true)} />
            <Marker position={westernUSCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setWesternUSInfoOpen(true)} />
            <Marker position={canadianBorealCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setCanadianBorealInfoOpen(true)} />
            <Marker position={chineseTemperateCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setChineseTemperateInfoOpen(true)} />
            <Marker position={eastEuropeanTaigaCenter} icon={{ url: '/hansen-forest-images/pin_sprite.png', scaledSize: new google.maps.Size(48, 48), anchor: new google.maps.Point(24, 48) }} onClick={() => setEastEuropeanTaigaInfoOpen(true)} />
          </>
        )}

        {createInfoCard(amazonCenter, amazonInfoOpen, setAmazonInfoOpen, handleAmazonClick, "Amazon Rainforest")}
        {createInfoCard(southeastAsianCenter, southeastAsianInfoOpen, setSoutheastAsianInfoOpen, handleSoutheastAsianClick, "Southeast Asian Forest")}
        {createInfoCard(centralAmericanCenter, centralAmericanInfoOpen, setCentralAmericanInfoOpen, handleCentralAmericanClick, "Mesoamerican Tropical Forests")}
        {createInfoCard(siberianCenter, siberianInfoOpen, setSiberianInfoOpen, handleSiberianClick, "Siberian Taiga")}
        {createInfoCard(easternUSCenter, easternUSInfoOpen, setEasternUSInfoOpen, handleEasternUSClick, "Eastern Deciduous Forests")}
        {createInfoCard(westernUSCenter, westernUSInfoOpen, setWesternUSInfoOpen, handleWesternUSClick, "Pacific Northwest Forests")}
        {createInfoCard(canadianBorealCenter, canadianBorealInfoOpen, setCanadianBorealInfoOpen, handleCanadianBorealClick, "Canadian Boreal Forest")}
        {createInfoCard(chineseTemperateCenter, chineseTemperateInfoOpen, setChineseTemperateInfoOpen, handleChineseTemperateClick, "Chinese Temperate Forests")}
        {createInfoCard(eastEuropeanTaigaCenter, eastEuropeanTaigaInfoOpen, setEastEuropeanTaigaInfoOpen, handleEastEuropeanTaigaClick, "East European Taiga")}

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

      {anyForestClicked && showStats && (
        <div className={`absolute top-5 right-5 w-80 z-50 transition-all duration-700 ease-out transform ${
          showStats ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'
        }`}>
          <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-green-500/30 shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-950/30 to-green-900/20 p-3 border-b border-green-500/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-1">
                    {currentForest && forestNames[currentForest as ForestKey]}
                  </h3>
                  <p className="text-gray-300 text-xs">Deforestation Analysis • {year}</p>
                </div>
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            <div className="p-3 space-y-3">
              {isLoadingData ? (
                <div className="flex items-center justify-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
                  <span className="ml-3 text-gray-300 text-sm">Loading data...</span>
                </div>
              ) : deforestationData ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-green-950/20 border border-green-500/30 p-2 rounded-lg">
                      <div className="text-lg font-bold text-green-400 mb-1">
                        {formatNumber(deforestationData.deforestation_area_km2)}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">km² Lost</div>
                    </div>
                    <div className="bg-green-950/20 border border-green-500/30 p-2 rounded-lg">
                      <div className="text-lg font-bold text-green-400 mb-1">
                        {formatNumber(deforestationData.carbon_loss_tonnes)}
                      </div>
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Tonnes CO₂</div>
                    </div>
                  </div>

                  <div className="bg-green-950/20 border border-green-500/30 p-2 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 text-sm">Yearly Change</span>
                      <div className={`flex items-center space-x-1 ${
                        deforestationData.yearly_change_percent >= 0 ? 'text-red-400' : 'text-green-400'
                      }`}>
                        <span className="text-sm font-bold">
                          {deforestationData.yearly_change_percent >= 0 ? '+' : ''}
                          {deforestationData.yearly_change_percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-950/20 border border-green-500/30 p-2 rounded-lg">
                    <div className="text-xs text-gray-300 mb-1">Total Cumulative Loss</div>
                    <div className="text-sm font-bold text-green-400">
                      {formatNumber(deforestationData.cumulative_deforestation_km2)} km²
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-green-300 uppercase tracking-wide">Impact Comparisons</h4>
                    <div className="space-y-1 max-h-24 overflow-y-auto">
                      {deforestationData.cool_facts.map((fact, index) => (
                        <div 
                          key={index}
                          className="bg-green-950/20 border border-green-500/30 p-2 rounded-lg text-xs text-gray-300"
                        >
                          <span className="text-green-400">•</span> {fact}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-950/20 border border-green-500/30 p-2 rounded-lg">
                    <div className="text-xs text-green-300 uppercase tracking-wide mb-1">Summary</div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      {deforestationData.short_summary}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {anyForestClicked && (
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-[320px] z-50 bg-black/60 p-4 rounded-xl shadow-lg border border-gray-700">
          <div className="flex justify-between items-center text-white text-sm mb-2">
            <span>Year</span>
            <span className="font-mono">{year}</span>
          </div>
          <input
            type="range"
            min={2001}
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
              background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(rawYear - 2001) / 23 * 100}%, #2e2e2e ${(rawYear - 2001) / 23 * 100}%, #2e2e2e 100%)`,
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

      {anyForestClicked && (
        <button
          className="absolute top-5 left-5 z-50 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition"
          onClick={handleBack}
        >
          ← Back
        </button>
      )}

      {!anyForestClicked && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-green-950/30 border border-green-500/30 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center space-x-2">
            <div className="w-5 h-5 bg-green-500/20 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            </div>
            <span className="text-sm text-green-300 whitespace-nowrap">
              Click on the pins and move the slider!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// Add the missing forestPolygonOptions constant
const forestPolygonOptions = {
  fillColor: '#ff7b0020',
  fillOpacity: 0.3,
  strokeColor: '#aa3e00ff',
  strokeOpacity: 0.8,
  strokeWeight: 2,
};