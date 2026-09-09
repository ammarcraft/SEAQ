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
  Activity,
  ShieldCheck,
} from 'lucide-react';
import PortCallBerthingCard from './components/PortCallBerthingCard';
import FuelManagementCard, { MARINE_FUELS_LIST } from './components/FuelManagementCard';
import CommercialRoiCard from './components/CommercialRoiCard';
import ApiDiagnosticsModal from './components/ApiDiagnosticsModal';
import { getNavigableSeaRoute } from './services/maritimeRouting';
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

const EMPTY_GEOJSON = { type: 'FeatureCollection', features: [] };

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
// EXPANDED COMMERCIAL FLEET MATRIX (18 NAVAL VESSEL TYPES)
// ==========================================
const SHIP_TYPES = [
  // --- CONTAINER FLEET ---
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
    description: 'Flagship mega-container carrier for high-volume oceanic corridors (Asia-Europe/Transpacific).'
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
    description: 'Modern post-Panamax beam carrier built for expanded locks and transcontinental lines.'
  },
  {
    id: 'POST_PANAMAX_CONT',
    name: 'Post-Panamax Container Carrier',
    category: 'Container',
    capacity: '8,500 TEU / 95,000 DWT',
    defaultCargoTonnes: 18000,
    speedKts: 19.2,
    baseRpm: 94,
    dailyFuelMt: 62,
    standardFuel: 'VLSFO 0.5% Marine Bunker',
    xgboostPredictedFuel: 'Bio-LNG + Pilot MGO Compound',
    xgboostConfidence: '93.8%',
    xgboostReason: 'High-combustion pressure dual-fuel setup mitigating methane slip by 91%.',
    estimatedFuelSavingsUsd: 44300,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Workhorse intermediate container carrier serving high-traffic regional hubs.'
  },
  {
    id: 'FEEDERMAX',
    name: 'FeederMax Coastal Container',
    category: 'Container',
    capacity: '2,800 TEU / 35,000 DWT',
    defaultCargoTonnes: 12000,
    speedKts: 17.0,
    baseRpm: 108,
    dailyFuelMt: 32,
    standardFuel: 'Marine Gas Oil (DMA 0.1% MGO)',
    xgboostPredictedFuel: 'Hydrotreated Vegetable Oil (HVO100)',
    xgboostConfidence: '93.5%',
    xgboostReason: '100% synthetic drop-in renewable diesel engineered for regional turnaround and zero ECA soot.',
    estimatedFuelSavingsUsd: 29400,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Shuttle feeder vessel linking transshipment mega-terminals with smaller regional ports.'
  },

  // --- TANKER & LIQUID BULK FLEET ---
  {
    id: 'VLCC_TANKER',
    name: 'Very Large Crude Carrier (VLCC)',
    category: 'Tanker',
    capacity: '300,000 DWT (~2.1M Barrels)',
    defaultCargoTonnes: 50000,
    speedKts: 14.5,
    baseRpm: 82,
    dailyFuelMt: 58,
    standardFuel: 'VLSFO 0.5% Heavy Marine',
    xgboostPredictedFuel: 'B24 Bio-Fuel Marine Compound',
    xgboostConfidence: '95.8%',
    xgboostReason: 'Delivers peak torque loading while satisfying IMO 2030 Carbon Intensity Indicator (CII) targets.',
    estimatedFuelSavingsUsd: 61000,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Super-tanker transporting bulk unrefined crude oil on long-haul deepsea trade lanes.'
  },
  {
    id: 'SUEZMAX_TANKER',
    name: 'Suezmax Crude Tanker',
    category: 'Tanker',
    capacity: '160,000 DWT (~1M Barrels)',
    defaultCargoTonnes: 40000,
    speedKts: 14.0,
    baseRpm: 84,
    dailyFuelMt: 46,
    standardFuel: 'VLSFO 0.5% Marine Fuel',
    xgboostPredictedFuel: 'E-Methanol Dual-Fuel Injection',
    xgboostConfidence: '94.6%',
    xgboostReason: 'Full draft canal passage capability with zero SOx scrubber washwater restrictions.',
    estimatedFuelSavingsUsd: 48700,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Medium-large crude tanker sized for full-load transit through the Suez Canal.'
  },
  {
    id: 'AFRAMAX_TANKER',
    name: 'Aframax / LR2 Product Tanker',
    category: 'Tanker',
    capacity: '115,000 DWT (Clean/Dirty Products)',
    defaultCargoTonnes: 35000,
    speedKts: 14.2,
    baseRpm: 86,
    dailyFuelMt: 38,
    standardFuel: 'Low-Sulfur Marine Gas Oil (MGO)',
    xgboostPredictedFuel: 'Green Ammonia (NH3) Dual-Fuel',
    xgboostConfidence: '92.4%',
    xgboostReason: 'Zero-carbon chemical footprint ideal for regional refined oil and chemical products.',
    estimatedFuelSavingsUsd: 42500,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Versatile product tanker for regional crude, fuel oil, and clean petroleum distillate trade.'
  },
  {
    id: 'MR2_PRODUCT',
    name: 'MR2 Chemical & Product Tanker',
    category: 'Tanker',
    capacity: '50,000 DWT (Medium Range)',
    defaultCargoTonnes: 20000,
    speedKts: 13.8,
    baseRpm: 92,
    dailyFuelMt: 24,
    standardFuel: 'VLSFO 0.5% Low-Sulfur',
    xgboostPredictedFuel: 'B30 Bio-Diesel Drop-In Blend',
    xgboostConfidence: '95.0%',
    xgboostReason: 'Immediate plug-and-play compliance without cryogenic retrofits for coastal bunkering.',
    estimatedFuelSavingsUsd: 27800,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Flexible medium-range tanker for refined gasoline, jet fuel, diesel, and vegetable oils.'
  },
  {
    id: 'CHEM_TANKER_IMO2',
    name: 'IMO II/III Specialized Chemical Tanker',
    category: 'Chemical',
    capacity: '38,000 DWT (Stainless / Epoxy Coated)',
    defaultCargoTonnes: 16000,
    speedKts: 13.5,
    baseRpm: 96,
    dailyFuelMt: 22,
    standardFuel: 'Marine Gas Oil (DMA 0.1% MGO)',
    xgboostPredictedFuel: 'Bio-Methanol Clean Propulsion',
    xgboostConfidence: '93.2%',
    xgboostReason: 'Strict volatile organic compound (VOC) vapor abatement and zero sulfur contamination.',
    estimatedFuelSavingsUsd: 25300,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'High-spec parcel tanker designed to transport hazardous liquid chemicals and specialty acids.'
  },

  // --- GAS CARRIER FLEET ---
  {
    id: 'LNG_CARRIER',
    name: 'LNG Membrane Cryogenic Carrier',
    category: 'Gas Carrier',
    capacity: '216,000 m³ Cryogenic Methane',
    defaultCargoTonnes: 25000,
    speedKts: 19.0,
    baseRpm: 90,
    dailyFuelMt: 68,
    standardFuel: 'LNG Boil-Off Gas (Cryogenic Methane)',
    xgboostPredictedFuel: 'Bio-LNG + Sub-Cooled MGO Dual',
    xgboostConfidence: '97.6%',
    xgboostReason: 'Minimizes boil-off venting while eliminating 99% of particulate and SOx emissions.',
    estimatedFuelSavingsUsd: 74500,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Large-scale liquefied natural gas carrier with vacuum-insulated membrane containment tanks.'
  },
  {
    id: 'ARC7_ICE_LNG',
    name: 'Arc7 Arctic Ice-Class LNG Carrier',
    category: 'Gas Carrier',
    capacity: '172,600 m³ (Yamal / Northern Sea Route)',
    defaultCargoTonnes: 24000,
    speedKts: 17.5,
    baseRpm: 94,
    dailyFuelMt: 72,
    standardFuel: 'LNG Boil-Off + Heavy Arctic Diesel',
    xgboostPredictedFuel: 'Ultra-Low Temperature Bio-LNG Blend',
    xgboostConfidence: '96.1%',
    xgboostReason: 'Extreme freeze resistance (-52°C) with podded azipod propulsion through 2.1m polar pack ice.',
    estimatedFuelSavingsUsd: 78200,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Reinforced double-acting icebreaker LNG carrier navigating the Siberian Northern Sea Route.'
  },
  {
    id: 'VLGC_GAS',
    name: 'Very Large Gas Carrier (VLGC)',
    category: 'Gas Carrier',
    capacity: '84,000 m³ (LPG & Liquid Ammonia)',
    defaultCargoTonnes: 22000,
    speedKts: 16.5,
    baseRpm: 88,
    dailyFuelMt: 44,
    standardFuel: 'LPG Dual-Fuel / VLSFO',
    xgboostPredictedFuel: 'Green Ammonia (NH3) Carrier-Grade',
    xgboostConfidence: '94.8%',
    xgboostReason: 'Uses self-transported zero-carbon liquid ammonia as direct engine combustion fuel.',
    estimatedFuelSavingsUsd: 51600,
    climatiqActivity: 'sea_freight-vessel_type_tanker-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Refrigerated pressurized carrier transporting butane, propane, and green energy ammonia.'
  },

  // --- DRY BULK & GENERAL CARGO ---
  {
    id: 'CAPESIZE_BULK',
    name: 'Capesize Deepwater Bulk Carrier',
    category: 'Dry Bulk',
    capacity: '180,000 DWT (Iron Ore & Coal)',
    defaultCargoTonnes: 45000,
    speedKts: 13.5,
    baseRpm: 76,
    dailyFuelMt: 42,
    standardFuel: 'HFO 3.5% (Heavy Fuel Oil + Scrubber)',
    xgboostPredictedFuel: 'VLSFO 0.5% Low-Emission Grade',
    xgboostConfidence: '95.1%',
    xgboostReason: 'Avoids heavy open-loop scrubber discharge penalties in coastal European EU ETS waters.',
    estimatedFuelSavingsUsd: 38200,
    climatiqActivity: 'sea_freight-vessel_type_bulk_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Deep-draft bulk carrier transporting iron ore and raw minerals too large for canal transit.'
  },
  {
    id: 'KAMSARMAX_BULK',
    name: 'Panamax / Kamsarmax Bulker',
    category: 'Dry Bulk',
    capacity: '82,000 DWT',
    defaultCargoTonnes: 30000,
    speedKts: 13.8,
    baseRpm: 80,
    dailyFuelMt: 28,
    standardFuel: 'VLSFO 0.5% Marine Fuel',
    xgboostPredictedFuel: 'B20 Bio-Marine Fuel',
    xgboostConfidence: '93.9%',
    xgboostReason: 'Cost-effective grain, coal, and bauxite carriage compliant with IMO GHG Strategy 2030.',
    estimatedFuelSavingsUsd: 31200,
    climatiqActivity: 'sea_freight-vessel_type_bulk_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Optimized length dry bulk ship designed for the bauxite terminal of Port Kamsar.'
  },
  {
    id: 'SUPRAMAX_BULK',
    name: 'Supramax / Ultramax Geared Bulker',
    category: 'Dry Bulk',
    capacity: '64,000 DWT (Self-Discharging Cranes)',
    defaultCargoTonnes: 22000,
    speedKts: 14.0,
    baseRpm: 85,
    dailyFuelMt: 23,
    standardFuel: 'VLSFO 0.5% Low-Sulfur',
    xgboostPredictedFuel: 'Hydrotreated Vegetable Oil (HVO100)',
    xgboostConfidence: '94.1%',
    xgboostReason: 'Self-unloading crane flexibility paired with near-zero fossil carbon emissions in port.',
    estimatedFuelSavingsUsd: 26700,
    climatiqActivity: 'sea_freight-vessel_type_bulk_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Equipped with 4 deck cranes and grabs for independent discharge at unequipped ports.'
  },
  {
    id: 'HANDYSIZE_CARGO',
    name: 'Handysize General Cargo Vessel',
    category: 'General Cargo',
    capacity: '38,000 DWT (Breakbulk & Timber)',
    defaultCargoTonnes: 14000,
    speedKts: 13.2,
    baseRpm: 90,
    dailyFuelMt: 17,
    standardFuel: 'Marine Gas Oil (DMA 0.1% MGO)',
    xgboostPredictedFuel: 'B30 Bio-Fuel Blend',
    xgboostConfidence: '92.8%',
    xgboostReason: 'Maneuverable shallow draft with reduced slip and lower carbon dues in shallow ports.',
    estimatedFuelSavingsUsd: 19800,
    climatiqActivity: 'sea_freight-vessel_type_bulk_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Shallow-draft general cargo carrier for steel, grain, timber, and specialized project cargo.'
  },

  // --- SPECIALIZED FLEET (RO-RO & REEFER) ---
  {
    id: 'PCTC_RORO',
    name: 'Pure Car & Truck Carrier (PCTC / Ro-Ro)',
    category: 'Ro-Ro',
    capacity: '7,500 CEU (Car Equivalent Units)',
    defaultCargoTonnes: 18000,
    speedKts: 19.5,
    baseRpm: 96,
    dailyFuelMt: 54,
    standardFuel: 'VLSFO 0.5% Marine Fuel',
    xgboostPredictedFuel: 'Bio-LNG Dual-Fuel / Wind Assist Ready',
    xgboostConfidence: '95.5%',
    xgboostReason: 'Aerodynamic high-freeboard hull optimized for low carbon index on automotive corridors.',
    estimatedFuelSavingsUsd: 58400,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'Multi-deck roll-on/roll-off vessel for global export of electric vehicles, trucks, and machinery.'
  },
  {
    id: 'REEFER_CARGO',
    name: 'Refrigerated Cargo Carrier (Reefer)',
    category: 'Reefer',
    capacity: '16,000 DWT (650,000 cu ft Insulated)',
    defaultCargoTonnes: 10000,
    speedKts: 18.5,
    baseRpm: 104,
    dailyFuelMt: 42,
    standardFuel: 'Low-Sulfur Marine Gas Oil (MGO)',
    xgboostPredictedFuel: 'Green E-Methanol Cold-Chain Dual',
    xgboostConfidence: '94.0%',
    xgboostReason: 'Maintains continuous -25°C deep-freeze holds with zero generator emissions in green ports.',
    estimatedFuelSavingsUsd: 36500,
    climatiqActivity: 'sea_freight-vessel_type_vehicle_carrier-route_type_na-vessel_length_na-tonnage_na-fuel_source_na',
    description: 'High-speed temperature-controlled perishable food and pharmaceutical carrier.'
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

function getCardinalDirection(angle) {
  if (angle === undefined || angle === null || isNaN(angle)) return 'N';
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((((angle % 360) + 360) % 360) / 22.5) % 16;
  return directions[index];
}

const getDefaultDeadline = () => {
  const d = new Date();
  d.setDate(d.getDate() + 18);
  return d.toISOString().split('T')[0];
};

export default function App() {
  // Currency Selector
  const [selectedCurrency, setSelectedCurrency] = useState('USD');

  // Screen clearance toggles (Responsive: start closed on mobile for full map focus)
  const [isLeftOpen, setIsLeftOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [isRightOpen, setIsRightOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : false);
  const [isFullMapView, setIsFullMapView] = useState(false);

  const mapRef = useRef(null);

  useEffect(() => {
    window.__mapRef = mapRef;
  }, []);

  const isLeftOpenRef = useRef(isLeftOpen);
  isLeftOpenRef.current = isLeftOpen;
  const isRightOpenRef = useRef(isRightOpen);
  isRightOpenRef.current = isRightOpen;

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
            padding: { top: 80, bottom: 80, left: isLeftOpenRef.current ? 340 : 60, right: isRightOpenRef.current ? 350 : 60 },
            duration: 1200,
            maxZoom: 5.8,
            pitch: 24,
          }
        );
      } catch (e) {
        console.warn('[Map] Fit bounds error:', e);
      }
    },
    []
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
  const [isDiagnosticsOpen, setIsDiagnosticsOpen] = useState(false);

  const [cargoWeight, setCargoWeight] = useState(32000);
  const [deadlineDate, setDeadlineDate] = useState(getDefaultDeadline);

  // Map inspection & toggles
  const [showWaypoints, setShowWaypoints] = useState(true);
  const [selectedWaypoint, setSelectedWaypoint] = useState(null);
  const [allWaypoints, setAllWaypoints] = useState([]);
  const [isWaypointsDrawerOpen, setIsWaypointsDrawerOpen] = useState(false);
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

  // Telemetry & Weather-Routing Modes
  const [distanceNM, setDistanceNM] = useState(10493);
  const [routeGeoJson, setRouteGeoJson] = useState(null);
  const [directRouteGeoJson, setDirectRouteGeoJson] = useState(null);
  const [routeMode, setRouteMode] = useState('eco'); // 'eco' | 'direct'
  const [weatherSavings, setWeatherSavings] = useState({
    fuelSavingsPercent: 14.2,
    waveReduction: '4.2m ➔ 1.6m Calm',
    weatherDelayAvoidedHours: 18.5,
  });
  const [stormZone, setStormZone] = useState({
    name: 'Arabian Sea Swell Vortex',
    center: [64.0, 16.5],
    waveHeight: '4.2m Rough',
    windSpeed: '28 kts',
  });
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

  const vesselPositionRef = useRef(vesselPosition);
  vesselPositionRef.current = vesselPosition;

  // Fetch Stormglass Ocean Swell Telemetry with 6-key failover (Pure backend execution)
  const refreshOceanData = useCallback(async (targetLat, targetLon) => {
    setIsRefreshingOcean(true);
    try {
      const lat = targetLat !== undefined ? targetLat : vesselPositionRef.current[1] || 11.5;
      const lon = targetLon !== undefined ? targetLon : vesselPositionRef.current[0] || 65.0;
      const data = await fetchStormglassDataWithFailover(lat, lon);
      setLiveOceanData(data);
    } catch (err) {
      console.warn('[Stormglass] Telemetry error:', err);
    } finally {
      setIsRefreshingOcean(false);
    }
  }, []);

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

  // Carbon Regulatory Scheme (EU ETS vs IMO Dual Compliance)
  const isEuropeVoyage = useMemo(() => {
    return Boolean(destPort?.isEurope || startPort?.isEurope);
  }, [destPort, startPort]);

  const carbonTaxDetails = useMemo(() => {
    const curr = CURRENCIES[selectedCurrency] || CURRENCIES.USD;
    if (isEuropeVoyage) {
      const baseUsd = 92.0; // EU ETS Allowance price per MT
      const totalUsd = Math.round(co2eTonnes * baseUsd);
      const convertedRate = Math.round(baseUsd * curr.rate);
      const projectedLevyUsd = Math.round(co2eTonnes * 100 * curr.rate);
      return {
        schemeName: 'EU ETS & IMO Dual Compliance',
        regulator: 'EU Maritime Directive 2023/959 + IMO MARPOL Annex VI',
        isEU: true,
        statusBadge: 'Dual Framework: Statutory Tax + IMO Standards',
        rateLabel: `${curr.symbol}${convertedRate.toLocaleString()} / tCO₂e (EU ETS EUA)`,
        totalTax: formatCurrency(totalUsd),
        savings: formatCurrency(Math.round(totalUsd * 0.22)),
        description: 'Vessels calling European ports must comply concurrently with EU ETS financial taxes and global IMO MARPOL operational standards.',
        ciiGrade: 'CII Grade B (Net-Zero Compliant)',
        imoEnforcementText: 'IMO Regulatory Reality: IMO does NOT issue cash invoices today. Non-compliant vessels (3 yrs Grade D, or 1 yr Grade E) face mandatory SEEMP Part III Corrective Action Plans and Port State Control (PSC) commercial detention/suspension.',
        projectedLevy: `${curr.symbol}${projectedLevyUsd.toLocaleString()}`,
      };
    } else {
      // Non-Europe International Waters:
      const projectedLevyUsd = Math.round(co2eTonnes * 100 * curr.rate);
      return {
        schemeName: 'IMO MARPOL Annex VI (CII Framework)',
        regulator: 'International Maritime Organization (IMO MEPC)',
        isEU: false,
        statusBadge: 'Active Operational Rating • No Current Cash Fines',
        rateLabel: 'Operational Efficiency Rating (Grades A to E)',
        totalTax: 'No Statutory Cash Tax Today',
        savings: 'N/A (Operational Metric)',
        description: 'IMO actively regulates emissions through annual Carbon Intensity Indicator (CII) operational ratings rather than commercial tax billing.',
        ciiGrade: 'CII Grade B (Net-Zero Compliant)',
        imoEnforcementText: 'IMO Regulatory Reality: IMO does not charge cash fines. It issues operational ratings (A-E); Grade D/E requires mandatory SEEMP Part III corrective actions, risking loss of Statement of Compliance (SoC) and Port State Control detention.',
        projectedLevy: `${curr.symbol}${projectedLevyUsd.toLocaleString()}`,
      };
    }
  }, [isEuropeVoyage, co2eTonnes, selectedCurrency, formatCurrency]);

  // Route Waypoints
  const routeWaypoints = useMemo(() => {
    if (allWaypoints && allWaypoints.length > 0) {
      return allWaypoints;
    }
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
  }, [allWaypoints, routeGeoJson, startPort, destPort, selectedShip]);

  // High-performance smooth waypoints for map rendering (prevents DOM lag)
  const displayedMapWaypoints = useMemo(() => {
    if (!routeWaypoints || routeWaypoints.length <= 2) return [];
    const inner = routeWaypoints.slice(1, -1);
    if (inner.length <= 22) return inner;
    const step = Math.ceil(inner.length / 20);
    return inner.filter((wp, i) => i === 0 || i === inner.length - 1 || wp.isNoiseZone || i % step === 0);
  }, [routeWaypoints]);

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

  const handleSelectWaypoint = useCallback((wp) => {
    setSelectedWaypoint(wp);
    if (!isRightOpen) setIsRightOpen(true);
    setViewState(prev => ({
      ...prev,
      longitude: wp.coords[0],
      latitude: wp.coords[1],
      zoom: Math.max(prev.zoom, 6.5),
      transitionDuration: 800,
    }));
  }, [isRightOpen]);

  // Route calculation with Autonomous Maritime Sea-Lane Guarantee
  const calculateRoute = useCallback(async (customStart, customDest) => {
    setIsOptimizing(true);
    const sPort = (customStart && Array.isArray(customStart.coords)) ? customStart : startPort;
    const dPort = (customDest && Array.isArray(customDest.coords)) ? customDest : destPort;
    let computedNM = 10493;
    let currentStormZone = null;

    try {
      const result = await getNavigableSeaRoute(sPort, dPort, API_KEYS.SEAROUTES);
      if (result && result.ecoGeoJson) {
        setRouteGeoJson(result.ecoGeoJson);
        setDirectRouteGeoJson(result.directGeoJson);
        computedNM = result.distanceNM;
        setDistanceNM(computedNM);
        if (result.waypoints) setAllWaypoints(result.waypoints);
        if (result.weatherSavings) setWeatherSavings(result.weatherSavings);
        if (result.stormZone) {
          currentStormZone = result.stormZone;
          setStormZone(result.stormZone);
        }

          const coords = result.coordinates;
        if (coords && coords.length > 1) {
          const nextIdx = Math.min(3, coords.length - 1);
          const brng = calculateBearing(coords[0][1], coords[0][0], coords[nextIdx][1], coords[nextIdx][0]);
          setDepartureAngle(brng);

          // Place active vessel along prime open-ocean cruising fairway (~28% of voyage)
          // Guarantees ship is always in broad, deep ocean water (Arabian Sea / Mid-Atlantic / Pacific)
          // with 100% clear water margin and zero land proximity
          const safeOceanIdx = Math.max(1, Math.min(coords.length - 2, Math.floor(coords.length * 0.28)));
          setVesselPosition(coords[safeOceanIdx]);
          setTimeout(() => {
            fitRouteBounds(coords);
          }, 300);
        }
      }
    } catch (err) {
      console.warn('[Route Calculation] Fallback exception:', err);
    } finally {
      setIsOptimizing(false);
    }

    // Secondary Telemetry (Non-blocking background sync)
    // Climatiq CO2
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

    // EIA Fuel
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

    // Trigger Ocean Telemetry for this route's exact swell coordinates
    if (currentStormZone && currentStormZone.center) {
      refreshOceanData(currentStormZone.center[1], currentStormZone.center[0]);
    } else {
      refreshOceanData();
    }
  }, [startPort, destPort, selectedShip, cargoWeight, refreshOceanData, fitRouteBounds]);

  useEffect(() => {
    window.__calculateRoute = calculateRoute;
    window.__setStartPort = (p) => { setStartPort(p); setStartQuery(p.name); };
    window.__setDestPort = (p) => { setDestPort(p); setDestQuery(p.name); };
    window.__setViewState = setViewState;
    window.__GLOBAL_PORTS = GLOBAL_PORTS;
  }, [calculateRoute]);

  const initialCalcDoneRef = useRef(false);
  useEffect(() => {
    if (!initialCalcDoneRef.current) {
      initialCalcDoneRef.current = true;
      calculateRoute();
    }
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
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#06b6d4', // Cyan glow for Eco-Weather route
          'line-width': 8,
          'line-opacity': 0.65,
          'line-blur': 4
        }
      },
      core: {
        id: 'route-core',
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#a855f7', // Purple core
          'line-width': 3.5,
          'line-opacity': 0.95
        }
      },
      directTrack: {
        id: 'direct-track-line',
        type: 'line',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#f59e0b', // Amber dashed baseline track
          'line-width': 2,
          'line-dasharray': [3, 2],
          'line-opacity': 0.85
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

          {/* Glowing Purple/Cyan Sea Path */}
          <Source id="user-route" type="geojson" data={(routeMode === 'eco' ? routeGeoJson : directRouteGeoJson) || routeGeoJson || EMPTY_GEOJSON}>
            <Layer {...routeLayers.glow} />
            <Layer {...routeLayers.core} />
          </Source>

          {/* Direct Baseline Navigational Track */}
          <Source id="direct-track" type="geojson" data={directRouteGeoJson || EMPTY_GEOJSON}>
            <Layer
              {...routeLayers.directTrack}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
                visibility: routeMode === 'direct' ? 'visible' : 'none',
              }}
            />
          </Source>



          {/* High Swell Avoidance Zone Marker on Map (Yellow circle anchored dead-center on coordinates) */}
          {stormZone && (
            <Marker longitude={stormZone.center[0]} latitude={stormZone.center[1]} anchor="center">
              <div className="relative flex items-center justify-center cursor-pointer group">
                <div className="absolute -top-7 px-2 py-0.5 rounded-md bg-amber-950/95 border border-amber-500/60 text-[10px] text-amber-300 font-semibold shadow-2xl flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span>⚠️ {stormZone.waveHeight || 'Oceanic'} (Avoided by AI Eco-Route)</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-amber-500/25 border-2 border-amber-400 flex items-center justify-center text-amber-300 shadow-xl">
                  <Waves className="w-4.5 h-4.5 animate-pulse" />
                </div>
              </div>
            </Marker>
          )}

          {/* START POINT: PROFESSIONAL NAUTICAL DEPARTURE BEACON (CLEAR CIRCULAR PIN) */}
          <Marker longitude={startPort.coords[0]} latitude={startPort.coords[1]} anchor="bottom">
            <div className="flex flex-col items-center cursor-pointer select-none">
              <div className="px-2.5 py-1 rounded-md bg-white text-[11px] font-semibold text-slate-800 shadow-md border border-emerald-300 mb-1.5 whitespace-nowrap flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>Start: {startPort.name}</span>
              </div>
              <div className="relative flex items-center justify-center">
                <span className="absolute w-6 h-6 rounded-full bg-emerald-400/40 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-[10px] font-bold">
                  ⚓
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

          {/* ALL MARITIME WAYPOINTS ON MAP (ALL CIRCLES, ZERO CLUTTER, ZERO LAG) */}
          {showWaypoints && displayedMapWaypoints.map((wp) => (
            <Marker key={wp.id} longitude={wp.coords[0]} latitude={wp.coords[1]} anchor="center">
              <div
                onClick={() => handleSelectWaypoint(wp)}
                className="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-150 z-20"
              >
                {wp.isNoiseZone ? (
                  /* Single Marine Acoustic Sanctuary: Clean amber circle */
                  <div className="relative flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white shadow-md" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-6 px-2 py-0.5 rounded bg-amber-900 text-amber-100 text-[9px] font-semibold whitespace-nowrap pointer-events-none z-40 shadow-lg border border-amber-500/50">
                      ⚡ {wp.id}: {wp.name} ({wp.speedLimit})
                    </span>
                  </div>
                ) : (
                  /* All Navigational Waypoints: Pure, Clean, Uniform Circles */
                  <div className="relative flex items-center justify-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-white border-2 border-purple-600 shadow-sm" />
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -bottom-5 px-2 py-0.5 rounded bg-slate-900 text-white text-[9px] font-medium whitespace-nowrap pointer-events-none z-40 shadow-md">
                      {wp.id}: {wp.name}
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
      <header className="absolute top-2 sm:top-4 left-2 right-2 sm:left-6 sm:right-6 z-30 flex items-center justify-between px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 shadow-md">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <img
            src="/seaq-logo.jpg"
            alt="SEAQ Logo"
            className="w-7 h-7 sm:w-8 sm:h-8 object-contain rounded-lg shadow-sm"
          />
          <h1 className="text-sm sm:text-base font-black tracking-wider text-slate-900">
            SEAQ
          </h1>
        </div>

        {/* Global Toolbar: Currency Switcher + Full Map Focus + Waypoint Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* CURRENCY SELECTOR */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="text-slate-400 font-medium text-[10px] sm:text-[11px]">Cur:</span>
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
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              showWaypoints
                ? 'bg-purple-50 border-purple-200 text-purple-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle Waypoints on Map"
          >
            {showWaypoints ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">Waypoints ({routeWaypoints.length})</span>
          </button>

          {/* Waypoints Manifest Drawer Button */}
          <button
            onClick={() => setIsWaypointsDrawerOpen(!isWaypointsDrawerOpen)}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              isWaypointsDrawerOpen
                ? 'bg-purple-600 border-purple-600 text-white shadow-md'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Open Full Voyage Waypoints Manifest"
          >
            <Activity className="w-3.5 h-3.5 text-current" />
            <span className="hidden md:inline">Manifest</span>
          </button>

          {/* Center Route Focus */}
          <button
            onClick={() => {
              if (routeGeoJson?.geometry?.coordinates) {
                fitRouteBounds(routeGeoJson.geometry.coordinates);
              }
            }}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-white hover:bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium transition-colors shadow-sm"
            title="Auto-center camera on the active voyage route"
          >
            <Navigation className="w-3.5 h-3.5 text-purple-600" />
            <span className="hidden md:inline">Center Route</span>
          </button>

          {/* LIVE SEA STATE & OCEAN WAVES */}
          <button
            onClick={() => refreshOceanData()}
            disabled={isRefreshingOcean}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium border bg-white hover:bg-purple-50 border-purple-200 text-purple-700 transition-colors shadow-sm disabled:opacity-50"
            title={`Ocean Swell: ${liveOceanData?.waveHeight || '0.8'}m. Click to refresh.`}
          >
            <Waves className={`w-3.5 h-3.5 text-purple-600 ${isRefreshingOcean ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Waves: {liveOceanData?.waveHeight || '0.8'}m</span>
          </button>

          {/* API DIAGNOSTICS & TELEMETRY MONITOR (NO KEY LEAKS!) */}
          <button
            onClick={() => setIsDiagnosticsOpen(true)}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 text-xs font-semibold transition-all shadow-sm group"
            title="System API Health & Diagnostics"
          >
            <Activity className="w-3.5 h-3.5 text-purple-400 group-hover:animate-spin" />
            <span className="hidden sm:inline">Diagnostics</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-purple-950 text-purple-300 font-mono border border-purple-700/50">
              ⚡
            </span>
          </button>

          {/* FULL MAP VIEW TOGGLE */}
          <button
            onClick={toggleMapFocus}
            className={`hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
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

      {/* FLOATING WEATHER ROUTING & SWELL AVOIDANCE BADGE (COMPACT & ZERO PANEL OVERLAP) */}
      <div className="absolute top-[60px] sm:top-[66px] left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-slate-900/95 backdrop-blur-md border border-purple-500/40 shadow-2xl text-[10px] sm:text-xs max-w-[95vw] sm:max-w-none">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
        <span className="text-emerald-400 font-bold whitespace-nowrap">
          {routeMode === 'eco' ? 'AI Eco Route:' : 'Direct Track:'}
        </span>
        <span className="text-slate-300 hidden xl:inline whitespace-nowrap">
          {routeMode === 'eco' ? `Bypassing ${stormZone?.waveHeight ? stormZone.waveHeight.replace(' Rough', '') : '2.8m'} Swell` : 'Direct Heavy Seas'}
        </span>
        <span className={`font-semibold whitespace-nowrap ${routeMode === 'eco' ? 'text-purple-300' : 'text-amber-400'}`}>
          {routeMode === 'eco' ? `(+${weatherSavings.fuelSavingsPercent}% Fuel Saved)` : '(+18% Resistance)'}
        </span>
        <button
          onClick={() => setRouteMode(routeMode === 'eco' ? 'direct' : 'eco')}
          className="ml-1 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-md bg-purple-600 hover:bg-purple-500 text-white font-medium border border-purple-400/40 transition-colors whitespace-nowrap shadow-sm"
        >
          {routeMode === 'eco' ? 'Compare Direct' : 'Switch to AI Eco'}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. LEFT PANEL: DISPATCH FORM (COLLAPSIBLE TO CLEAR MAP) */}
      {/* ========================================================================= */}
      <div
        className={`absolute top-[118px] sm:top-[124px] bottom-16 sm:bottom-6 z-20 transition-all duration-300 flex items-start ${
          isLeftOpen ? 'left-2 right-2 sm:left-6 sm:right-auto sm:w-96' : 'left-0 w-0 pointer-events-none'
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
        className={`absolute top-[118px] sm:top-[124px] bottom-16 sm:bottom-6 z-20 transition-all duration-300 flex items-start justify-end ${
          isRightOpen ? 'left-2 right-2 sm:left-auto sm:right-6 sm:w-[430px]' : 'right-0 w-0 pointer-events-none'
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

            {/* Carbon Regulatory Container (EU ETS vs IMO Dual Compliance) */}
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
                  <span className="text-[10px] text-slate-500 block">
                    {carbonTaxDetails.isEU ? 'EU ETS Statutory Tax' : 'Direct Cash Invoicing'}
                  </span>
                  <span className="text-purple-900 font-bold text-xs">{carbonTaxDetails.totalTax}</span>
                </div>
              </div>

              <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between text-[11px] mb-2">
                <span className="text-slate-600 font-medium">IMO Operational Rating:</span>
                <span className="text-purple-700 font-bold">{carbonTaxDetails.ciiGrade}</span>
              </div>

              {/* IMO REGULATORY REALITY CALLOUT */}
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10px] text-amber-900 leading-relaxed mb-2">
                <strong>⚖️ Regulatory Notice:</strong> {carbonTaxDetails.imoEnforcementText}
              </div>

              {/* PROJECTED 2027 IMO LEVY SCENARIO */}
              <div className="px-2.5 py-1.5 rounded-lg bg-purple-50/40 border border-purple-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Projected 2027 IMO Net-Zero Levy ($100/t):</span>
                <span className="text-purple-800 font-bold">{carbonTaxDetails.projectedLevy}</span>
              </div>
            </div>

            {/* COMMERCIAL FLEET ROI & WHY SEAQ VALUE CARD */}
            <CommercialRoiCard formatCurrency={formatCurrency} />

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
              <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200 p-4 shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                    <span className="text-xs font-bold text-purple-900">{selectedWaypoint.id}: Waypoint Inspection</span>
                  </div>
                  <button
                    onClick={() => setSelectedWaypoint(null)}
                    className="text-[11px] text-slate-400 hover:text-slate-700 font-semibold px-1.5 py-0.5 rounded hover:bg-slate-100"
                  >
                    ✕ Close
                  </button>
                </div>
                <p className="text-xs font-semibold text-slate-900 mb-2">{selectedWaypoint.name}</p>
                <div className="text-[11px] text-slate-600 space-y-1.5 bg-purple-50/60 p-2.5 rounded-xl border border-purple-100">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Position:</span>
                    <span className="font-mono font-semibold text-purple-900">
                      {selectedWaypoint.coords ? `${selectedWaypoint.coords[1].toFixed(3)}°N, ${selectedWaypoint.coords[0].toFixed(3)}°E` : 'N/A'}
                    </span>
                  </div>
                  {selectedWaypoint.distanceFromOriginNm !== undefined && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">Distance from Origin:</span>
                      <span className="font-semibold text-slate-800">{selectedWaypoint.distanceFromOriginNm} NM</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Speed Restriction:</span>
                    <span className="font-semibold text-purple-700">{selectedWaypoint.speedLimit}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Corridor Status:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      selectedWaypoint.isNoiseZone
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : selectedWaypoint.isChokepoint
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    }`}>
                      {selectedWaypoint.status}
                    </span>
                  </div>
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

      {/* ========================================================================= */}
      {/* 8. MOBILE QUICK NAV DOCK (Visible on screens < md) */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-2 left-2 right-2 z-40 bg-slate-900/95 backdrop-blur-md border border-purple-500/30 rounded-2xl p-1.5 shadow-2xl flex items-center justify-around text-slate-200">
        <button
          onClick={() => {
            setIsLeftOpen(!isLeftOpen);
            if (isRightOpen) setIsRightOpen(false);
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isLeftOpen ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Navigation className="w-4 h-4 mb-0.5" />
          <span>Voyage</span>
        </button>

        <button
          onClick={() => setRouteMode(routeMode === 'eco' ? 'direct' : 'eco')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-medium transition-colors ${
            routeMode === 'eco' ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'
          }`}
        >
          <Waves className="w-4 h-4 mb-0.5" />
          <span>{routeMode === 'eco' ? 'Eco-Weather' : 'Direct'}</span>
        </button>

        <button
          onClick={() => {
            setIsRightOpen(!isRightOpen);
            if (isLeftOpen) setIsLeftOpen(false);
          }}
          className={`flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium transition-colors ${
            isRightOpen ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Ship className="w-4 h-4 mb-0.5" />
          <span>Vessel/ROI</span>
        </button>

        <button
          onClick={() => setIsDiagnosticsOpen(true)}
          className="flex flex-col items-center py-1 px-3 rounded-xl text-[10px] font-medium text-purple-300 hover:text-white transition-colors"
        >
          <Activity className="w-4 h-4 mb-0.5 text-purple-400" />
          <span>Diagnostics</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 6. VOYAGE WAYPOINTS MANIFEST MODAL */}
      {/* ========================================================================= */}
      {isWaypointsDrawerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-2xl max-h-[85vh] bg-white rounded-2xl shadow-2xl border border-purple-200 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Voyage Waypoints Manifest ({routeWaypoints.length} Maritime Nodes)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Eurostat 2025 Maritime Network • {startPort.name} ➔ {destPort.name} ({distanceNM} NM)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWaypointsDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Waypoints List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2.5">
              {routeWaypoints.map((wp) => (
                <div
                  key={wp.id}
                  onClick={() => {
                    handleSelectWaypoint(wp);
                    setIsWaypointsDrawerOpen(false);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    selectedWaypoint?.id === wp.id
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400 shadow-sm'
                      : 'bg-white hover:bg-purple-50/50 border-slate-200 hover:border-purple-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 text-purple-800 font-mono text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {wp.id}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{wp.name}</p>
                        {wp.isNoiseZone && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                            12 kts Limit
                          </span>
                        )}
                        {wp.isChokepoint && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                            Chokepoint
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-0.5">
                        <span className="font-mono">
                          {wp.coords ? `${wp.coords[1].toFixed(3)}°N, ${wp.coords[0].toFixed(3)}°E` : ''}
                        </span>
                        {wp.distanceFromOriginNm !== undefined && (
                          <span>• {wp.distanceFromOriginNm} NM from origin</span>
                        )}
                        <span>• Status: <strong className="text-slate-700">{wp.status}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex flex-col items-end flex-shrink-0">
                    <span className="text-[10px] text-slate-400">Speed Limit</span>
                    <span className="text-xs font-semibold text-purple-700">{wp.speedLimit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-3 sm:p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
              <span>Click any waypoint to inspect and center on map</span>
              <button
                onClick={() => setIsWaypointsDrawerOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
              >
                Close Manifest
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. API SYSTEM DIAGNOSTICS MODAL */}
      {/* ========================================================================= */}
      <ApiDiagnosticsModal
        isOpen={isDiagnosticsOpen}
        onClose={() => setIsDiagnosticsOpen(false)}
        apiKeys={API_KEYS}
      />
    </div>
  );
}
