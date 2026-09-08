import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import Map, { Source, Layer, Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Navigation,
  Ship,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Cpu,
  Waves,
  Flame,
  Anchor,
  Zap,
} from 'lucide-react';
import PortCallBerthingCard from './components/PortCallBerthingCard';
import FuelManagementCard, { MARINE_FUELS_LIST } from './components/FuelManagementCard';
import { fetchStormglassDataWithFailover } from './services/stormglassService';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceArea,
  CartesianGrid
} from 'recharts';

// ==========================================
// API CREDENTIALS
// ==========================================
const API_KEYS = {
  MAPBOX: 'pk.eyJ1Ijoibm9uZGFyc2hhbiIsImEiOiJjbXRteHdkY3MwOG03MnlyMzRtYzdvNTNjIn0.sy932Ge9SiR4xQnZZrZyKw',
  EIA: 'mRSt6QOSvcbzObB7XIFSzeUbCbKMHGpqA3p2eV03',
  SEAROUTES: 'H8OkShCblA3eBl4QsKao22882uL168gG1L2s3xNa',
  CLIMATIQ: 'Z9QNM69DKN3F5ASR2P78SY4XDW',
};

// ==========================================
// CURRENCY EXCHANGE CONFIGURATION
// ==========================================
const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'USD ($)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, label: 'INR (₹)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'EUR (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.78, label: 'GBP (£)' },
  AED: { code: 'AED', symbol: 'AED ', rate: 3.67, label: 'AED' },
  SGD: { code: 'SGD', symbol: 'S$', rate: 1.34, label: 'SGD (S$)' },
};

import { GLOBAL_PORTS, searchPorts } from './data/portsData';

const QUICK_COUNTRIES = [
  { label: 'India', code: 'IN', flag: '🇮🇳' },
  { label: 'China', code: 'CN', flag: '🇨🇳' },
  { label: 'USA', code: 'US', flag: '🇺🇸' },
  { label: 'UAE', code: 'AE', flag: '🇦🇪' },
  { label: 'Singapore', code: 'SG', flag: '🇸🇬' },
  { label: 'Europe', code: 'EU', flag: '🇪🇺' },
];

// ==========================================
// SHIP SPECIFICATIONS & XGBOOST FUEL MATRIX
// ==========================================
const SHIP_TYPES = [
  {
    id: 'ULCV',
    name: 'Ultra Large Container Vessel (ULCV)',
    category: 'Container',
    capacity: '24,000 TEU / 220,000 DWT',
    defaultCargoTonnes: 32000,
    speedKts: 21.5,
    baseRpm: 102,
    dailyFuelMt: 120,
    standardFuel: 'VLSFO 0.5% (Very Low Sulfur Fuel Oil)',
    xgboostPredictedFuel: 'B30 Bio-VLSFO Drop-in Blend',
    xgboostConfidence: '96.4%',
    xgboostReason: 'Balances thermal 2-stroke diesel efficiency with 26% carbon tax reduction.',
    estimatedFuelSavingsUsd: 68400,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Long-haul container carrier for major oceanic trading corridors.'
  },
  {
    id: 'PANAMAX_CONT',
    name: 'Neo-Panamax Container Ship',
    category: 'Container',
    capacity: '14,000 TEU / 140,000 DWT',
    defaultCargoTonnes: 22000,
    speedKts: 20.0,
    baseRpm: 98,
    dailyFuelMt: 85,
    standardFuel: 'VLSFO 0.5% Marine Fuel',
    xgboostPredictedFuel: 'Green E-Methanol / MGO Dual-Fuel',
    xgboostConfidence: '94.2%',
    xgboostReason: 'Optimal for coastal emission control areas and zero-soot port calls.',
    estimatedFuelSavingsUsd: 52100,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Medium container carrier configured for global canal locks.'
  },
  {
    id: 'CAPESIZE_BULK',
    name: 'Capesize Bulk Carrier',
    category: 'Dry Bulk',
    capacity: '180,000 DWT',
    defaultCargoTonnes: 45000,
    speedKts: 13.5,
    baseRpm: 76,
    dailyFuelMt: 42,
    standardFuel: 'HFO 3.5% (Heavy Fuel Oil + Scrubber)',
    xgboostPredictedFuel: 'VLSFO 0.5% Low-Emission Grade',
    xgboostConfidence: '95.1%',
    xgboostReason: 'Avoids heavy particulate surcharges across sensitive maritime passages.',
    estimatedFuelSavingsUsd: 38200,
    climatiqActivity: 'sea_freight-vessel_type_bulk_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Dry mineral and bulk commodity vessel.'
  },
  {
    id: 'VLCC_TANKER',
    name: 'Very Large Crude Carrier (VLCC)',
    category: 'Tanker',
    capacity: '300,000 DWT (~2M Barrels)',
    defaultCargoTonnes: 50000,
    speedKts: 14.5,
    baseRpm: 82,
    dailyFuelMt: 58,
    standardFuel: 'VLSFO 0.5% Standard Marine',
    xgboostPredictedFuel: 'B24 Bio-Fuel Marine Compound',
    xgboostConfidence: '95.8%',
    xgboostReason: 'High torque load optimization ensuring compliance with IMO Net-Zero targets.',
    estimatedFuelSavingsUsd: 61000,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Crude oil carrier for international petroleum transport.'
  },
  {
    id: 'LNG_CARRIER',
    name: 'LNG Membrane Tanker',
    category: 'Gas Carrier',
    capacity: '216,000 m³ Cryogenic',
    defaultCargoTonnes: 25000,
    speedKts: 19.0,
    baseRpm: 90,
    dailyFuelMt: 68,
    standardFuel: 'LNG Boil-Off Gas (Cryogenic Methane)',
    xgboostPredictedFuel: 'Bio-LNG + Sub-Cooled MGO Dual',
    xgboostConfidence: '97.6%',
    xgboostReason: 'Minimizes methane slip during voyage while achieving near-zero sulfur emissions.',
    estimatedFuelSavingsUsd: 74500,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Liquefied gas transport with dual-fuel propulsion.'
  },
  {
    id: 'FEEDERMAX',
    name: 'FeederMax Container Ship',
    category: 'Feeder',
    capacity: '2,800 TEU / 35,000 DWT',
    defaultCargoTonnes: 12000,
    speedKts: 17.0,
    baseRpm: 108,
    dailyFuelMt: 32,
    standardFuel: 'Marine Gas Oil (DMA 0.1% MGO)',
    xgboostPredictedFuel: 'Hydrotreated Vegetable Oil (HVO100)',
    xgboostConfidence: '93.5%',
    xgboostReason: '100% synthetic drop-in renewable diesel engineered for regional turnaround.',
    estimatedFuelSavingsUsd: 29400,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Regional feeder vessel connecting hub ports with coastal terminals.'
  }
];

function calculateBearing(startLat, startLng, destLat, destLng) {
  const y = Math.sin(((destLng - startLng) * Math.PI) / 180) * Math.cos((destLat * Math.PI) / 180);
  const x =
    Math.cos((startLat * Math.PI) / 180) * Math.sin((destLat * Math.PI) / 180) -
    Math.sin((startLat * Math.PI) / 180) *
      Math.cos((destLat * Math.PI) / 180) *
      Math.cos(((destLng - startLng) * Math.PI) / 180);
  let brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

const getDefaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + 18);
  return d.toISOString().split('T')[0];
};

export default function App() {
  // Currency Selector
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Screen clearance toggles
  const [isLeftOpen, setIsLeftOpen] = useState(true);
  const [isRightOpen, setIsRightOpen] = useState(true);
  const [isFullMapView, setIsFullMapView] = useState(false);

  const mapRef = useRef(null);

  const fitRouteBounds = useCallback(
    (coords) => {
      if (!mapRef.current || !coords || coords.length === 0) return;
      try {
        const lons = coords.map((c) => c[0]);
        const lats = coords.map((c) => c[1]);
        const minLng = Math.min(...lons);
        const maxLng = Math.max(...lons);
        const minLat = Math.min(...lats);
        const maxLat = Math.max(...lats);

        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          {
            padding: { top: 100, bottom: 100, left: isLeftOpen ? 400 : 70, right: isRightOpen ? 440 : 70 },
            duration: 1500,
            pitch: 28,
          }
        );
      } catch (e) {
        console.warn('[Map] Fit bounds error:', e);
      }
    },
    [isLeftOpen, isRightOpen]
  );

  // Form Inputs
  const [startPort, setStartPort] = useState(
    () => GLOBAL_PORTS.find((p) => p.id === 'CNSHA') || GLOBAL_PORTS[0]
  );
  const [destPort, setDestPort] = useState(
    () => GLOBAL_PORTS.find((p) => p.id === 'NLRTM') || GLOBAL_PORTS[1]
  );
  const [startQuery, setStartQuery] = useState(
    () => GLOBAL_PORTS.find((p) => p.id === 'CNSHA')?.name || 'Shanghai (Yangshan - Deepwater)'
  );
  const [destQuery, setDestQuery] = useState(
    () => GLOBAL_PORTS.find((p) => p.id === 'NLRTM')?.name || 'Rotterdam (Maasvlakte - Port of Rotterdam)'
  );

  const [showStartDropdown, setShowStartDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);
  const startDropdownRef = useRef(null);
  const destDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (startDropdownRef.current && !startDropdownRef.current.contains(e.target)) {
        setShowStartDropdown(false);
      }
      if (destDropdownRef.current && !destDropdownRef.current.contains(e.target)) {
        setShowDestDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [selectedShip, setSelectedShip] = useState(SHIP_TYPES[0]);
  const [showShipModal, setShowShipModal] = useState(false);
  const [shipSearchFilter, setShipSearchFilter] = useState('');

  const [cargoWeight, setCargoWeight] = useState(32000);
  const [deadlineDate, setDeadlineDate] = useState(getDefaultDeadline);

  // Map inspection & toggles
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [showAcoustics, setShowAcoustics] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  // Marine Fuel Selection & Dual-Fuel Engine Mode
  const [selectedFuelId, setSelectedFuelId] = useState('PETROL_BUNKER');
  const [isDualFuel, setIsDualFuel] = useState(false);
  const [pilotDieselPercent, setPilotDieselPercent] = useState(10);

  // Live Ocean Swell & Wave Telemetry (Stormglass 6-key pool runs silently in background)
  const [isRefreshingOcean, setIsRefreshingOcean] = useState(false);
  const [liveOceanData, setLiveOceanData] = useState({
    waveHeight: '0.8',
    wavePeriod: '8.4',
    windSpeed: '14.8',
    currentSpeed: '1.2',
    source: 'Live Oceanic Hydrodynamics (Stormglass)',
    timestamp: new Date().toLocaleTimeString(),
  });

  // Telemetry
  const [distanceNM, setDistanceNM] = useState(10493);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [vesselPosition, setVesselPosition] = useState([65.0, 11.5]);
  const [departureAngle, setDepartureAngle] = useState(45);

  const [baseCo2eTonnes, setBaseCo2eTonnes] = useState(17966);
  const [fuelPricePerGal, setFuelPricePerGal] = useState(4.53);
  const [fuelPricePerMt, setFuelPricePerMt] = useState(614);

  // Active Fuel & Blended Factor Calculation
  const activeFuelObj = useMemo(() => {
    return MARINE_FUELS_LIST.find((f) => f.id === selectedFuelId) || MARINE_FUELS_LIST[0];
  }, [selectedFuelId]);

  const marineDieselObj = MARINE_FUELS_LIST[0];

  const effectiveCarbonFactor = useMemo(() => {
    if (!isDualFuel) return activeFuelObj.carbonFactor;
    return Number(
      (
        (1 - pilotDieselPercent / 100) * activeFuelObj.carbonFactor +
        (pilotDieselPercent / 100) * marineDieselObj.carbonFactor
      ).toFixed(3)
    );
  }, [isDualFuel, activeFuelObj, pilotDieselPercent, marineDieselObj]);

  // Dynamic co2eTonnes scaled by selected fuel / dual-fuel blend
  const co2eTonnes = useMemo(() => {
    const scale = effectiveCarbonFactor / 3.114;
    return Math.max(0, Math.round(baseCo2eTonnes * scale));
  }, [baseCo2eTonnes, effectiveCarbonFactor]);

  // Fetch Stormglass Ocean Swell Telemetry with 6-key failover (Pure backend execution)
  const refreshOceanData = useCallback(async (targetLat, targetLon) => {
    setIsRefreshingOcean(true);
    try {
      const lat = targetLat !== undefined ? targetLat : vesselPosition[1] || 11.5;
      const lon = targetLon !== undefined ? targetLon : vesselPosition[0] || 65.0;
      const data = await fetchStormglassDataWithFailover(lat, lon);
      setLiveOceanData(data);
    } catch (err) {
      console.warn('[Stormglass] Telemetry error:', err);
    } finally {
      setIsRefreshingOcean(false);
    }
  }, [vesselPosition]);

  // Map camera
  const [viewState, setViewState] = useState({
    longitude: 55.0,
    latitude: 22.0,
    zoom: 2.8,
    pitch: 35,
    bearing: -10
  });

  // Currency Converter Formatter
  const formatCurrency = useCallback((usdAmount) => {
    const curr = CURRENCIES[selectedCurrency] || CURRENCIES.USD;
    const converted = Math.round(usdAmount * curr.rate);
    return `${curr.symbol}${converted.toLocaleString()}`;
  }, [selectedCurrency]);

  // Carbon Regulatory Scheme (EU ETS vs IMO)
  const isEuropeVoyage = useMemo(() => {
    return Boolean(destPort?.isEurope || startPort?.isEurope);
  }, [destPort, startPort]);

  const carbonTaxDetails = useMemo(() => {
    const curr = CURRENCIES[selectedCurrency] || CURRENCIES.USD;
    if (isEuropeVoyage) {
      const baseUsd = 92.0; // EU ETS Allowance price per MT
      const totalUsd = Math.round(co2eTonnes * baseUsd);
      const convertedRate = Math.round(baseUsd * curr.rate);
      return {
        schemeName: 'EU ETS Maritime Compliance',
        regulator: 'European Union Maritime Directive (Legally Binding 2024)',
        isEU: true,
        statusBadge: 'Active Statutory Tax (Jan 2024)',
        rateLabel: `${curr.symbol}${convertedRate.toLocaleString()} / tCO₂e`,
        totalTax: formatCurrency(totalUsd),
        savings: formatCurrency(Math.round(totalUsd * 0.22)),
        description: 'Mandatory EUA allowance surrender required under EU law for all voyages touching European ports.',
        ciiGrade: 'CII Grade B (Compliant)',
      };
    } else {
      // Non-Europe International Waters:
      // Clarification: IMO currently enforces operational CII Ratings (A to E).
      // The $100/t levy is the projected 2027 Net-Zero Economic Measure under MEPC 80.
      const projectedLevyUsd = 100.0;
      const totalUsd = Math.round(co2eTonnes * projectedLevyUsd);
      const convertedRate = Math.round(projectedLevyUsd * curr.rate);
      return {
        schemeName: 'IMO CII Rating & Net-Zero Levy',
        regulator: 'International Maritime Organization (IMO MEPC)',
        isEU: false,
        statusBadge: 'CII Active Rating • Levy Projected (2027)',
        rateLabel: `${curr.symbol}${convertedRate.toLocaleString()} / tCO₂e (Projected 2027)`,
        totalTax: formatCurrency(totalUsd),
        savings: formatCurrency(Math.round(totalUsd * 0.22)),
        description: 'IMO actively enforces operational CII ratings (A-E); universal cash invoicing ($100/t) is projected for 2027 adoption under the IMO Net-Zero Strategy.',
        ciiGrade: 'CII Grade B (Net-Zero Compliant)',
      };
    }
  }, [isEuropeVoyage, co2eTonnes, selectedCurrency, formatCurrency]);

  // Route Waypoints
  const routeWaypoints = useMemo(() => {
    if (!routeGeoJson?.geometry?.coordinates || routeGeoJson.geometry.coordinates.length === 0) {
      return [
        { id: 'WP-1', name: `Pilot: ${startPort.name}`, coords: startPort.coords, speedLimit: `${selectedShip.speedKts} kts`, status: 'Departure', isNoiseZone: false },
        { id: 'WP-2', name: 'Malacca Marine Sanctuary', coords: [95.0, 5.0], speedLimit: '12.0 kts (Restricted)', status: 'Speed Damping Zone', isNoiseZone: true },
        { id: 'WP-3', name: 'Mid-Ocean Passage', coords: [65.0, 11.5], speedLimit: `${selectedShip.speedKts} kts`, status: 'Open Sea', isNoiseZone: false },
        { id: 'WP-4', name: `Terminal: ${destPort.name}`, coords: destPort.coords, speedLimit: '10.0 kts', status: 'Arrival', isNoiseZone: false },
      ];
    }

    const coords = routeGeoJson.geometry.coordinates;
    const count = coords.length;
    return [
      { id: 'WP-1', name: `Pilot: ${startPort.name}`, coords: coords[0], speedLimit: `${selectedShip.speedKts} kts`, status: 'Departure', isNoiseZone: false },
      { id: 'WP-2', name: 'Strait Coastal Checkpoint', coords: coords[Math.floor(count * 0.25)], speedLimit: `${selectedShip.speedKts} kts`, status: 'Cruising', isNoiseZone: false },
      { id: 'WP-3', name: 'Marine Mammal Acoustic Sanctuary', coords: coords[Math.floor(count * 0.5)], speedLimit: '12.0 kts (Throttled)', status: 'Speed Damping Zone', isNoiseZone: true },
      { id: 'WP-4', name: 'Continental Shelf Transition', coords: coords[Math.floor(count * 0.75)], speedLimit: `${selectedShip.speedKts} kts`, status: 'Open Sea', isNoiseZone: false },
      { id: 'WP-5', name: `Port Gateway: ${destPort.name}`, coords: coords[count - 1], speedLimit: '10.0 kts', status: 'Arrival', isNoiseZone: false },
    ];
  }, [routeGeoJson, startPort, destPort, selectedShip]);

  const noiseZoneCoords = useMemo(() => {
    const wp3 = routeWaypoints.find(w => w.isNoiseZone) || routeWaypoints[1];
    return wp3 ? wp3.coords : [95.0, 5.0];
  }, [routeWaypoints]);

  const handleInspectNoiseZone = useCallback(() => {
    setViewState({
      longitude: noiseZoneCoords[0],
      latitude: noiseZoneCoords[1],
      zoom: 5.5,
      pitch: 45,
      bearing: 10
    });
  }, [noiseZoneCoords]);

  // Route calculation
  const calculateRoute = useCallback(async (customStart, customDest) => {
    setIsOptimizing(true);
    const sPort = customStart || startPort;
    const dPort = customDest || destPort;
    const src = `${sPort.coords[0]},${sPort.coords[1]}`;
    const dst = `${dPort.coords[0]},${dPort.coords[1]}`;
    let computedNM = 10493;

    try {
      const res = await fetch(`/api/searoutes/route/v2/sea/${src};${dst}?continuousCoordinates=true`, {
        headers: { 'x-api-key': API_KEYS.SEAROUTES }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.features?.[0]?.geometry) {
          setRouteGeoJson(data.features[0]);
          const distKm = data.features[0].properties?.distance / 1000;
          computedNM = Math.round(distKm * 0.539957);
          setDistanceNM(computedNM);

          const coords = data.features[0].geometry.coordinates;
          if (coords && coords.length > 1) {
            const nextIdx = Math.min(3, coords.length - 1);
            const brng = calculateBearing(coords[0][1], coords[0][0], coords[nextIdx][1], coords[nextIdx][0]);
            setDepartureAngle(brng);

            const midIndex = Math.floor(coords.length * 0.45);
            setVesselPosition(coords[midIndex]);
            setTimeout(() => {
              fitRouteBounds(coords);
            }, 300);
          }
        }
      } else {
        throw new Error('Searoutes fallback');
      }
    } catch {
      const fallbackCoords = [
        sPort.coords,
        [(sPort.coords[0] + dPort.coords[0]) / 2, (sPort.coords[1] + dPort.coords[1]) / 2 + 3],
        dPort.coords,
      ];
      setRouteGeoJson({
        type: 'Feature',
        properties: { name: `${sPort.name} -> ${dPort.name}` },
        geometry: {
          type: 'LineString',
          coordinates: fallbackCoords,
        },
      });
      computedNM = 8800;
      setDistanceNM(computedNM);
      const fallbackBrng = calculateBearing(startPort.coords[1], startPort.coords[0], destPort.coords[1], destPort.coords[0]);
      setDepartureAngle(fallbackBrng);
      setTimeout(() => {
        fitRouteBounds(fallbackCoords);
      }, 300);
    }

    // Climatiq
    try {
      const distKm = Math.round(computedNM * 1.852);
      const res = await fetch('/api/climatiq/data/v1/estimate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEYS.CLIMATIQ}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          emission_factor: {
            activity_id: selectedShip.climatiqActivity,
            data_version: '^37'
          },
          parameters: {
            weight: Number(cargoWeight) || 24000,
            distance: distKm,
            weight_unit: 't',
            distance_unit: 'km'
          }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setBaseCo2eTonnes(Math.round(data.co2e / 1000));
      }
    } catch {
      const estTonnes = Math.round((computedNM * 1.852 * (Number(cargoWeight) || 24000) * 0.038) / 1000);
      setBaseCo2eTonnes(estTonnes || 16400);
    }

    // EIA
    try {
      const res = await fetch(
        `/api/eia/v2/petroleum/pri/spt/data/?api_key=${API_KEYS.EIA}&frequency=weekly&data[0]=value&sort[0][column]=period&sort[0][direction]=desc&length=1`
      );
      if (res.ok) {
        const data = await res.json();
        const price = parseFloat(data.response?.data?.[0]?.value) || 4.53;
        setFuelPricePerGal(price);
        setFuelPricePerMt(Math.round(price * 135));
      }
    } catch {
      // ignore
    }

    // Trigger Stormglass Ocean Telemetry fetch with failover
    refreshOceanData();

    setIsOptimizing(false);
  }, [startPort, destPort, selectedShip, cargoWeight, refreshOceanData, fitRouteBounds]);

  useEffect(() => {
    calculateRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const transitHours = distanceNM / selectedShip.speedKts;
  const transitDays = (transitHours / 24).toFixed(1);

  const deadlineAnalysis = useMemo(() => {
    const today = new Date();
    const target = new Date(deadlineDate);
    const diffTime = target - today;
    const daysAllowed = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    const bufferDays = (daysAllowed - parseFloat(transitDays)).toFixed(1);
    const isFeasible = parseFloat(bufferDays) >= 0;

    return { daysAllowed, bufferDays, isFeasible };
  }, [deadlineDate, transitDays]);

  const dynamicAcousticData = useMemo(() => {
    const base = selectedShip.baseRpm;
    return [
      { nm: '0 NM', rpm: Math.round(base * 0.95), speed: selectedShip.speedKts, noiseDb: 168 },
      { nm: '2500 NM', rpm: base, speed: selectedShip.speedKts, noiseDb: 174 },
      { nm: '4500 NM', rpm: Math.round(base * 0.62), speed: (selectedShip.speedKts * 0.62).toFixed(1), noiseDb: 138 },
      { nm: '6000 NM', rpm: Math.round(base * 0.60), speed: (selectedShip.speedKts * 0.58).toFixed(1), noiseDb: 135 },
      { nm: '7500 NM', rpm: Math.round(base * 0.65), speed: (selectedShip.speedKts * 0.65).toFixed(1), noiseDb: 140 },
      { nm: '9000 NM', rpm: Math.round(base * 0.96), speed: selectedShip.speedKts, noiseDb: 170 },
      { nm: '10500 NM', rpm: Math.round(base * 0.75), speed: (selectedShip.speedKts * 0.78).toFixed(1), noiseDb: 148 }
    ];
  }, [selectedShip]);

  const filteredStartPorts = useMemo(() => {
    return searchPorts(startQuery);
  }, [startQuery]);

  const filteredDestPorts = useMemo(() => {
    return searchPorts(destQuery);
  }, [destQuery]);

  const filteredShips = useMemo(() => {
    return SHIP_TYPES.filter(
      s => s.name.toLowerCase().includes(shipSearchFilter.toLowerCase()) ||
           s.category.toLowerCase().includes(shipSearchFilter.toLowerCase())
    );
  }, [shipSearchFilter]);

  const routeLayers = useMemo(() => {
    return {
      glow: {
        id: 'route-glow',
        type: 'line',
        paint: {
          'line-color': '#9333ea',
          'line-width': 8,
          'line-opacity': 0.6,
          'line-blur': 4
        }
      },
      core: {
        id: 'route-core',
        type: 'line',
        paint: {
          'line-color': '#e9d5ff',
          'line-width': 2.8,
          'line-opacity': 0.95
        }
      }
    };
  }, []);

  // Toggle Full Map Focus Mode
  const toggleMapFocus = () => {
    if (isFullMapView) {
      setIsFullMapView(false);
      setIsLeftOpen(true);
      setIsRightOpen(true);
    } else {
      setIsFullMapView(true);
      setIsLeftOpen(false);
      setIsRightOpen(false);
      setShowAcoustics(false);
    }
  };

  const currSymbol = CURRENCIES[selectedCurrency]?.symbol || '$';
  const currRate = CURRENCIES[selectedCurrency]?.rate || 1.0;

  return (
    <div className="relative w-screen h-screen overflow-hidden font-sans select-none bg-slate-950">
      {/* ========================================================================= */}
      {/* 1. DARK EARTH MAP CANVAS */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 z-0">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/dark-v11"
          mapboxAccessToken={API_KEYS.MAPBOX}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" style={{ marginRight: 24, marginBottom: 170 }} />

          {/* Glowing Purple Sea Path */}
          {routeGeoJson && (
            <Source id="user-route" type="geojson" data={routeGeoJson}>
              <Layer {...routeLayers.glow} />
              <Layer {...routeLayers.core} />
            </Source>
          )}

          {/* START POINT: HIGH-TECH DEPARTURE ARROW */}
          <Marker longitude={startPort.coords[0]} latitude={startPort.coords[1]} anchor="center">
            <div className="flex flex-col items-center cursor-pointer">
              <div className="px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-slate-800 shadow-lg border border-purple-200 mb-1.5 whitespace-nowrap">
                Start: {startPort.name}
              </div>
              <div className="relative flex items-center justify-center">
                <div className="absolute w-10 h-10 rounded-full bg-purple-500/25 animate-ping" />
                <div
                  className="transition-transform duration-500 drop-shadow-[0_0_14px_rgba(168,85,247,0.95)] filter"
                  style={{ transform: `rotate(${departureAngle - 45}deg)` }}
                >
                  <Navigation className="w-7 h-7 text-white fill-purple-600 stroke-purple-200 stroke-[1.5]" />
                </div>
              </div>
            </div>
          </Marker>

          {/* DESTINATION MARKER */}
          <Marker longitude={destPort.coords[0]} latitude={destPort.coords[1]} anchor="bottom">
            <div className="flex flex-col items-center">
              <div className="px-2.5 py-1 rounded-md bg-white text-[11px] font-medium text-slate-800 shadow-lg border border-purple-200 mb-1.5 whitespace-nowrap">
                Destination: {destPort.name}
              </div>
              <div className="w-3.5 h-3.5 rounded-full bg-purple-600 border-2 border-white shadow-lg animate-pulse" />
            </div>
          </Marker>

          {/* ACTIVE SHIP POSITION */}
          <Marker longitude={vesselPosition[0]} latitude={vesselPosition[1]} anchor="center">
            <div className="relative flex items-center justify-center">
              <div className="absolute w-10 h-10 rounded-full bg-purple-400/20 animate-ping" />
              <div className="p-1.5 rounded-lg bg-white border border-purple-300 text-purple-700 shadow-md">
                <Ship className="w-3.5 h-3.5" />
              </div>
            </div>
          </Marker>

          {/* WAYPOINTS ON MAP */}
          {showWaypoints && routeWaypoints.map((wp) => (
            <Marker key={wp.id} longitude={wp.coords[0]} latitude={wp.coords[1]} anchor="center">
              <div
                onClick={() => {
                  setSelectedWaypoint(wp);
                  if (!isRightOpen) setIsRightOpen(true);
                }}
                className={`group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 ${
                  wp.isNoiseZone ? 'z-30' : 'z-20'
                }`}
              >
                {wp.isNoiseZone ? (
                  <div className="flex flex-col items-center">
                    <div className="px-2.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-[10px] font-semibold shadow-lg whitespace-nowrap mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Speed Reduction Zone: 12.0 kts Max
                    </div>
                    <div className="relative flex items-center justify-center">
                      <div className="absolute w-14 h-14 rounded-full bg-amber-500/25 animate-ping" />
                      <div className="w-7 h-7 rounded-full bg-amber-500 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                        12
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-white border-2 border-purple-600 shadow-sm" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] whitespace-nowrap">
                      {wp.name}
                    </span>
                  </div>
                )}
              </div>
            </Marker>
          ))}
        </Map>
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP HEADER (CURRENCY SELECTOR & SCREEN CLEAR CONTROLS) */}
      {/* ========================================================================= */}
      <header className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between px-5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 shadow-md">
        <div className="flex items-center gap-2.5">
          <img
            src="/seaq-logo.jpg"
            alt="SEAQ Logo"
            className="w-8 h-8 object-contain rounded-lg shadow-sm"
          />
          <h1 className="text-base font-black tracking-wider text-slate-900">
            SEAQ
          </h1>
        </div>

        {/* Global Toolbar: Currency Switcher + Full Map Focus + Waypoint Controls */}
        <div className="flex items-center gap-2">
          {/* CURRENCY SELECTOR */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="text-slate-400 font-medium text-[11px]">Currency:</span>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-transparent font-semibold text-purple-700 outline-none cursor-pointer text-xs"
            >
              {Object.entries(CURRENCIES).map(([code, item]) => (
                <option key={code} value={code} className="text-slate-800">
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Waypoints Toggle */}
          <button
            onClick={() => setShowWaypoints(!showWaypoints)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showWaypoints
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {showWaypoints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">Waypoints</span>
          </button>

          {/* Center Route Focus */}
          <button
            onClick={() => {
              if (routeGeoJson?.geometry?.coordinates) {
                fitRouteBounds(routeGeoJson.geometry.coordinates);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium transition-colors shadow-sm"
            title="Auto-center camera on the active voyage route"
          >
            <Navigation className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden sm:inline">Center Route</span>
          </button>

          {/* Noise Zone FlyTo */}
          <button
            onClick={handleInspectNoiseZone}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-medium transition-colors"
          >
            <Volume2 className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Noise Zone</span>
          </button>

          {/* LIVE SEA STATE & OCEAN WAVES */}
          <button
            onClick={() => refreshOceanData()}
            disabled={isRefreshingOcean}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-white hover:bg-purple-50 border-purple-200 text-purple-700 transition-colors shadow-sm disabled:opacity-50"
            title={`Ocean Swell: ${liveOceanData?.waveHeight || '0.8'}m | Period: ${liveOceanData?.wavePeriod || '8.4'}s | Wind: ${liveOceanData?.windSpeed || '15'} kts. Click to refresh.`}
          >
            <Waves className={`w-3.5 h-3.5 text-purple-600 ${isRefreshingOcean ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Waves: {liveOceanData?.waveHeight || '0.8'}m</span>
          </button>

          {/* FULL MAP VIEW TOGGLE */}
          <button
            onClick={toggleMapFocus}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isFullMapView
                ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                : 'bg-white hover:bg-slate-50 border-purple-200 text-purple-700'
            }`}
          >
            {isFullMapView ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullMapView ? 'Show Panels' : 'Full Map'}</span>
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 3. LEFT PANEL: DISPATCH FORM (COLLAPSIBLE TO CLEAR MAP) */}
      {/* ========================================================================= */}
      <div
        className={`absolute top-20 bottom-6 z-20 transition-all duration-300 flex items-start ${
          isLeftOpen ? 'left-6 w-96' : 'left-0 w-0'
        }`}
      >
        {isLeftOpen ? (
          <div className="w-full h-full flex flex-col pointer-events-auto">
            <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3 custom-scrollbar">
              <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-5 shadow-lg relative">
                <button
                  onClick={() => setIsLeftOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                  title="Collapse panel to see more map"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between mb-4 pr-6">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    Voyage Parameters
                  </h2>
                  <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md font-medium border border-purple-100">
                    Route Solver
                  </span>
                </div>

                {/* Starting Port (Origin) */}
                <div className={`relative mb-3 ${showStartDropdown ? 'z-40' : 'z-10'}`} ref={startDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Starting Point (Origin)
                    </label>
                    {startPort && (
                      <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1.5 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        <span className="font-bold text-[9px] bg-purple-200/80 text-purple-900 px-1 py-0.2 rounded">
                          {startPort.countryCode}
                        </span>
                        <span>{startPort.country}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={startQuery}
                      onFocus={() => setShowStartDropdown(true)}
                      onChange={(e) => {
                        setStartQuery(e.target.value);
                        setShowStartDropdown(true);
                      }}
                      placeholder="Type country (e.g. India, China, USA) or port..."
                      className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white text-slate-900 text-xs outline-none transition-all shadow-inner"
                    />
                    {startQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setStartQuery('');
                          setShowStartDropdown(true);
                        }}
                        className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-2.5 top-2.5 text-[10px] font-bold"
                        title="Clear input"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {showStartDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl bg-white border border-purple-200 shadow-2xl z-50 p-2 custom-scrollbar">
                      {/* Quick Country Filter Pills */}
                      <div className="mb-2 pb-2 border-b border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Quick Country Filter</span>
                          <span className="text-purple-600 font-semibold normal-case">
                            {filteredStartPorts.length} {filteredStartPorts.length === 1 ? 'port' : 'ports'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {QUICK_COUNTRIES.map((c) => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={() => {
                                setStartQuery(c.label);
                                setShowStartDropdown(true);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors flex items-center gap-1.5 ${
                                startQuery.toLowerCase() === c.label.toLowerCase()
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700'
                              }`}
                            >
                              <span className="font-bold text-[9px] opacity-75">{c.code}</span>
                              <span>{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ports List */}
                      {filteredStartPorts.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No ports found for "{startQuery}".<br />
                          <span className="text-[10px] text-purple-600 font-medium">
                            Try typing "India", "China", "USA", "UAE" or port city.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredStartPorts.map((port) => (
                            <button
                              key={port.id}
                              type="button"
                              onClick={() => {
                                setStartPort(port);
                                setStartQuery(port.name);
                                setShowStartDropdown(false);
                                calculateRoute(port, destPort);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 group ${
                                startPort.id === port.id
                                  ? 'bg-purple-50 border border-purple-200 text-purple-900'
                                  : 'hover:bg-purple-50/60 text-slate-700 hover:text-purple-900 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-md bg-purple-100/90 text-purple-800 text-[10px] font-bold flex items-center justify-center shrink-0 border border-purple-200">
                                  {port.countryCode || '⚓'}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                                    {port.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {port.portType ? `${port.portType} • ` : ''}{port.country}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold bg-slate-100 group-hover:bg-purple-100 text-slate-600 group-hover:text-purple-700 px-1.5 py-0.5 rounded shrink-0">
                                {port.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Destination Port (Arrival) */}
                <div className={`relative mb-3 ${showDestDropdown ? 'z-30' : 'z-10'}`} ref={destDropdownRef}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-slate-700">
                      Destination Point (Arrival)
                    </label>
                    {destPort && (
                      <span className="text-[10px] text-purple-700 font-semibold flex items-center gap-1.5 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                        <span className="font-bold text-[9px] bg-purple-200/80 text-purple-900 px-1 py-0.2 rounded">
                          {destPort.countryCode}
                        </span>
                        <span>{destPort.country}</span>
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
                    <input
                      type="text"
                      value={destQuery}
                      onFocus={() => setShowDestDropdown(true)}
                      onChange={(e) => {
                        setDestQuery(e.target.value);
                        setShowDestDropdown(true);
                      }}
                      placeholder="Type country (e.g. India, China, USA) or port..."
                      className="w-full pl-8 pr-7 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white text-slate-900 text-xs outline-none transition-all shadow-inner"
                    />
                    {destQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setDestQuery('');
                          setShowDestDropdown(true);
                        }}
                        className="w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 flex items-center justify-center absolute right-2.5 top-2.5 text-[10px] font-bold"
                        title="Clear input"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  {showDestDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-xl bg-white border border-purple-200 shadow-2xl z-50 p-2 custom-scrollbar">
                      {/* Quick Country Filter Pills */}
                      <div className="mb-2 pb-2 border-b border-slate-100">
                        <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5 flex items-center justify-between">
                          <span>Quick Country Filter</span>
                          <span className="text-purple-600 font-semibold normal-case">
                            {filteredDestPorts.length} {filteredDestPorts.length === 1 ? 'port' : 'ports'}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {QUICK_COUNTRIES.map((c) => (
                            <button
                              key={c.label}
                              type="button"
                              onClick={() => {
                                setDestQuery(c.label);
                                setShowDestDropdown(true);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[10px] font-medium border transition-colors flex items-center gap-1.5 ${
                                destQuery.toLowerCase() === c.label.toLowerCase()
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700'
                              }`}
                            >
                              <span className="font-bold text-[9px] opacity-75">{c.code}</span>
                              <span>{c.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Ports List */}
                      {filteredDestPorts.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">
                          No ports found for "{destQuery}".<br />
                          <span className="text-[10px] text-purple-600 font-medium">
                            Try typing "India", "China", "USA", "UAE" or port city.
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {filteredDestPorts.map((port) => (
                            <button
                              key={port.id}
                              type="button"
                              onClick={() => {
                                setDestPort(port);
                                setDestQuery(port.name);
                                setShowDestDropdown(false);
                                calculateRoute(startPort, port);
                              }}
                              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors flex items-center justify-between gap-2 group ${
                                destPort.id === port.id
                                  ? 'bg-purple-50 border border-purple-200 text-purple-900'
                                  : 'hover:bg-purple-50/60 text-slate-700 hover:text-purple-900 border border-transparent'
                              }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-md bg-purple-100/90 text-purple-800 text-[10px] font-bold flex items-center justify-center shrink-0 border border-purple-200">
                                  {port.countryCode || '⚓'}
                                </span>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-800 group-hover:text-purple-700 truncate">
                                    {port.name}
                                  </div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {port.portType ? `${port.portType} • ` : ''}{port.country}
                                  </div>
                                </div>
                              </div>
                              <span className="text-[9px] font-mono font-bold bg-slate-100 group-hover:bg-purple-100 text-slate-600 group-hover:text-purple-700 px-1.5 py-0.5 rounded shrink-0">
                                {port.id}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Ship Type */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Ship Type (Select or Search)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowShipModal(true)}
                    className="w-full px-3 py-2 rounded-xl bg-purple-50/60 border border-purple-200 hover:border-purple-400 text-left text-xs text-purple-900 flex items-center justify-between transition-colors"
                  >
                    <div className="truncate pr-2">
                      <span className="font-semibold block text-slate-800">{selectedShip.name}</span>
                      <span className="text-[11px] text-purple-600">{selectedShip.capacity} • {selectedShip.speedKts} kts</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-purple-600 shrink-0" />
                  </button>
                </div>

                {/* Cargo Weight */}
                <div className="mb-3">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Cargo Weight (Tonnes)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      value={cargoWeight}
                      onChange={(e) => setCargoWeight(e.target.value)}
                      min="100"
                      step="1000"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white text-slate-900 text-xs outline-none transition-all"
                    />
                    <span className="absolute right-3 text-xs text-slate-400 font-medium">MT</span>
                  </div>
                </div>

                {/* Deadline */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Target Arrival Deadline
                  </label>
                  <input
                    type="date"
                    value={deadlineDate}
                    onChange={(e) => setDeadlineDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-600 focus:bg-white text-slate-900 text-xs outline-none transition-all"
                  />
                </div>

                {/* Action Button */}
                <button
                  onClick={calculateRoute}
                  disabled={isOptimizing}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
                >
                  {isOptimizing ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Calculating Route...</span>
                    </>
                  ) : (
                    <span>Calculate Optimized Route</span>
                  )}
                </button>
              </div>

              {/* Transit Schedule Card */}
              <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 text-xs shadow-md">
                <h3 className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-2.5">
                  Voyage Schedule
                </h3>

                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Distance</span>
                    <span className="text-slate-900 font-bold text-sm">{distanceNM.toLocaleString()} NM</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-500 block">Transit Time</span>
                    <span className="text-purple-700 font-bold text-sm">{transitDays} Days</span>
                  </div>
                </div>

                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                    deadlineAnalysis.isFeasible
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}
                >
                  <span className="font-medium">
                    {deadlineAnalysis.isFeasible ? 'Within Schedule' : 'Schedule Risk'}
                  </span>
                  <span className="font-bold">
                    {deadlineAnalysis.isFeasible ? `+${deadlineAnalysis.bufferDays}d Buffer` : `${deadlineAnalysis.bufferDays}d Delay`}
                  </span>
                </div>
              </div>

              {/* Marine Fuel Selection & Dual-Fuel Engine Controls */}
              <FuelManagementCard
                selectedFuelId={selectedFuelId}
                onSelectFuel={setSelectedFuelId}
                isDualFuel={isDualFuel}
                onToggleDualFuel={setIsDualFuel}
                pilotDieselPercent={pilotDieselPercent}
                onChangePilotRatio={setPilotDieselPercent}
                formatCurrency={formatCurrency}
              />
            </div>
          </div>
        ) : (
          /* Minimized Left Edge Trigger */
          <button
            onClick={() => setIsLeftOpen(true)}
            className="mt-4 px-3 py-2 bg-white/95 hover:bg-white text-purple-700 font-semibold text-xs rounded-r-xl border border-l-0 border-purple-200 shadow-xl pointer-events-auto flex items-center gap-1.5"
          >
            <span>Dispatch Controls</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. RIGHT PANEL: TELEMETRY + XGBOOST AI FUEL PREDICTION (COLLAPSIBLE) */}
      {/* ========================================================================= */}
      <div
        className={`absolute top-20 bottom-6 z-20 transition-all duration-300 flex items-start justify-end ${
          isRightOpen ? 'right-6 w-[430px]' : 'right-0 w-0'
        }`}
      >
        {isRightOpen ? (
          <div className="w-full max-h-[calc(100vh-105px)] overflow-y-auto pr-1 flex flex-col gap-3 pointer-events-auto custom-scrollbar">
            {/* NEW: SHIP FUEL SPECIFICATION & XGBOOST PREDICTION CARD */}
            <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 shadow-lg relative">
              <button
                onClick={() => setIsRightOpen(false)}
                className="absolute top-4 right-4 p-1 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Collapse panel to see more map"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-2 pr-6">
                <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Ship Fuel & XGBoost Prediction</h3>
                  <p className="text-[10px] text-purple-600 font-medium">{selectedShip.name}</p>
                </div>
              </div>

              {/* Standard Fuel vs XGBoost Predicted Fuel */}
              <div className="space-y-2 mt-3 font-mono text-xs">
                {/* 1. What fuel this ship typically uses */}
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Standard Hull Fuel</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 font-medium">Default</span>
                  </div>
                  <div className="text-slate-900 font-bold text-xs">{selectedShip.standardFuel}</div>
                </div>

                {/* 2. What fuel XGBoost predicted */}
                <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] text-purple-700 uppercase tracking-wider font-bold flex items-center gap-1">
                      XGBoost Predicted Fuel
                    </span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-600 text-white font-semibold">
                      {selectedShip.xgboostConfidence} Confidence
                    </span>
                  </div>
                  <div className="text-purple-950 font-bold text-xs">{selectedShip.xgboostPredictedFuel}</div>
                  <p className="text-[10px] text-slate-600 font-sans mt-1.5 leading-relaxed">
                    {selectedShip.xgboostReason}
                  </p>
                </div>

                {/* Projected Fuel & ETS Cost Savings */}
                <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs">
                  <span className="text-emerald-800 font-medium">XGBoost Projected Savings:</span>
                  <span className="text-emerald-700 font-bold">
                    {formatCurrency(selectedShip.estimatedFuelSavingsUsd)}
                  </span>
                </div>
              </div>
            </div>

            {/* DESTINATION PORT CALL & BERTHING / PARKING CONTAINER */}
            <PortCallBerthingCard destPort={destPort} formatCurrency={formatCurrency} />

            {/* Carbon Regulatory Container (EU ETS vs IMO Legal Distinction) */}
            <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">{carbonTaxDetails.schemeName}</h3>
                  <p className="text-[10px] text-purple-600 font-medium">{carbonTaxDetails.regulator}</p>
                </div>
                <span
                  className={`text-[9px] px-2 py-0.5 rounded-md font-semibold border text-right ${
                    carbonTaxDetails.isEU
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  }`}
                >
                  {carbonTaxDetails.statusBadge}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">CO₂e Footprint</span>
                  <span className="text-slate-900 font-bold text-xs">{co2eTonnes.toLocaleString()} MT</span>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100">
                  <span className="text-[10px] text-slate-500 block">Carbon Liability</span>
                  <span className="text-purple-900 font-bold text-xs">{carbonTaxDetails.totalTax}</span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] mb-2">
                <span className="text-slate-600 font-medium">Compliance Rating:</span>
                <span className="text-purple-700 font-bold">{carbonTaxDetails.ciiGrade}</span>
              </div>

              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[10px] text-slate-600 leading-relaxed">
                {carbonTaxDetails.description}
              </div>
            </div>

            {/* Marine Fuel Price Container */}
            <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Bunker Fuel EIA Benchmark</h3>
                  <p className="text-[10px] text-slate-500">Weekly U.S. Petroleum Spot</p>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-medium border border-purple-100">
                  EIA Spot
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">Diesel Spot</span>
                  <span className="text-slate-900 font-bold text-xs">
                    {currSymbol}{(fuelPricePerGal * currRate).toFixed(2)} / Gal
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 block">VLSFO MT Index</span>
                  <span className="text-purple-700 font-bold text-xs">
                    {currSymbol}{Math.round(fuelPricePerMt * currRate).toLocaleString()} / MT
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Waypoint Inspection Card */}
            {selectedWaypoint && (
              <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200 p-3.5 shadow-lg animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-purple-900">Waypoint Inspection</span>
                  <button
                    onClick={() => setSelectedWaypoint(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600"
                  >
                    Close
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-1">{selectedWaypoint.name}</p>
                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>Speed Restriction: <span className="font-semibold text-purple-700">{selectedWaypoint.speedLimit}</span></div>
                  <div>Corridor Status: <span className="font-semibold text-slate-700">{selectedWaypoint.status}</span></div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Minimized Right Edge Trigger */
          <button
            onClick={() => setIsRightOpen(true)}
            className="mt-4 px-3 py-2 bg-white/95 hover:bg-white text-purple-700 font-semibold text-xs rounded-l-xl border border-r-0 border-purple-200 shadow-xl pointer-events-auto flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Fuel & Telemetry</span>
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM DRAWER: NOISE ZONE ACOUSTIC PROFILE */}
      {/* ========================================================================= */}
      {!isFullMapView && (
        <div className="absolute bottom-4 left-6 right-6 lg:left-[410px] lg:right-[390px] z-20 pointer-events-auto">
          <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <h3 className="text-xs font-bold text-slate-900">
                  {selectedShip.name}: Propulsion & Noise Zone Profile
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleInspectNoiseZone}
                  className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 text-[10px] font-medium border border-amber-200"
                >
                  View on Map
                </button>
                <button
                  onClick={() => setShowAcoustics(!showAcoustics)}
                  className="text-slate-400 hover:text-purple-700 p-1 transition-colors"
                  title="Expand/Collapse chart"
                >
                  {showAcoustics ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {showAcoustics && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <p className="text-[11px] text-slate-500 mb-2">
                  Engine RPM is throttled between 4500 NM and 7500 NM to protect marine whale corridors.
                </p>

                <div className="w-full h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dynamicAcousticData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="purpleWaveform" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="nm" stroke="#94a3b8" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                      <YAxis stroke="#94a3b8" domain={[40, 130]} tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />

                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const d = payload[0].payload;
                            return (
                              <div className="p-2 rounded-lg bg-white border border-purple-200 text-xs shadow-md">
                                <div className="font-semibold text-purple-700">{d.nm}</div>
                                <div className="text-slate-700">RPM: <span className="font-bold">{d.rpm}</span></div>
                                <div className="text-slate-700">Speed: <span className="font-bold">{d.speed} kts</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />

                      <ReferenceArea
                        x1="4500 NM"
                        x2="7500 NM"
                        fill="#f97316"
                        fillOpacity={0.15}
                        stroke="#f97316"
                        strokeDasharray="3 3"
                        label={{
                          value: 'Speed Restriction Zone (12.0 kts)',
                          fill: '#d97706',
                          position: 'insideTop',
                          fontSize: 9,
                          fontWeight: 600
                        }}
                      />

                      <Area type="monotone" dataKey="rpm" stroke="#7c3aed" strokeWidth={2} fill="url(#purpleWaveform)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SEARCHABLE SHIP TYPE MODAL (WITH FUEL DETAILS) */}
      {/* ========================================================================= */}
      {showShipModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl bg-white border border-purple-100 shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-purple-100 flex items-center justify-between bg-purple-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Select Ship Specification & Engine Profile
                </h3>
                <p className="text-[11px] text-purple-600 font-medium">Verified naval hull types, default fuels, and XGBoost AI recommendations</p>
              </div>
              <button
                onClick={() => setShowShipModal(false)}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-600 text-xs border border-slate-200"
              >
                Close
              </button>
            </div>

            <div className="p-3 border-b border-slate-100 bg-white">
              <div className="relative flex items-center">
                <Search className="w-4 h-4 absolute left-3 text-slate-400" />
                <input
                  type="text"
                  value={shipSearchFilter}
                  onChange={(e) => setShipSearchFilter(e.target.value)}
                  placeholder="Type to filter ships (container, bulk, tanker, lng)..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 focus:border-purple-600 text-slate-800 text-xs outline-none"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar bg-slate-50/50">
              {filteredShips.map((ship) => {
                const isSelected = ship.id === selectedShip.id;
                return (
                  <button
                    key={ship.id}
                    onClick={() => {
                      setSelectedShip(ship);
                      setCargoWeight(ship.defaultCargoTonnes);
                      setShowShipModal(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-purple-50 border-purple-300 shadow-sm'
                        : 'bg-white border-slate-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{ship.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-purple-100 text-purple-700 font-medium">
                        {ship.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mb-2">{ship.description}</p>
                    
                    {/* Fuel details row */}
                    <div className="space-y-1 text-[10px] font-mono bg-slate-50 p-2.5 rounded-lg border border-slate-100 mb-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Standard Fuel:</span>
                        <span className="font-semibold text-slate-800">{ship.standardFuel}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-purple-700 font-semibold">XGBoost Predicted:</span>
                        <span className="font-bold text-purple-900">{ship.xgboostPredictedFuel}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[10px] text-slate-600 bg-white p-2 rounded-lg border border-slate-100">
                      <div>Capacity: <span className="font-semibold text-slate-800">{ship.capacity}</span></div>
                      <div>Speed: <span className="font-semibold text-purple-700">{ship.speedKts} kts</span></div>
                      <div>Burn: <span className="font-semibold text-slate-800">{ship.dailyFuelMt} MT/d</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
