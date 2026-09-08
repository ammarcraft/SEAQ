import React, { useState, useEffect } from 'react';
import { Anchor, Clock, Ship, Play, RotateCcw, AlertCircle, CheckCircle2, ChevronRight, Wind } from 'lucide-react';

// PORT CONGESTION DATABASE & ESTIMATED ANCHORAGE WAITING TIMES
const PORT_CALL_TRAFFIC_DATA = {
  // INDIA
  INBOM: {
    portName: 'Mumbai (JNPT - Nhava Sheva)',
    terminal: 'Bharat Mumbai Container Terminals (BMCT)',
    trafficLevel: 'Moderate',
    shipsInQueue: 12,
    avgWaitHours: 14.0,
    berthUtilization: '76%',
    recommendedAction: 'Tidal restriction window at Mumbai Harbor; synchronize arrival with high tide at +12h.',
    fuelSavedTonnes: 14.5,
  },
  BOM: {
    portName: 'Mumbai (JNPT)',
    terminal: 'Bharat Mumbai Container Terminals (BMCT)',
    trafficLevel: 'Moderate',
    shipsInQueue: 12,
    avgWaitHours: 14.0,
    berthUtilization: '76%',
    recommendedAction: 'Tidal restriction window at Mumbai Harbor; synchronize arrival with high tide at +12h.',
    fuelSavedTonnes: 14.5,
  },
  INMUN: {
    portName: 'Mundra Port (Adani Gujarat)',
    terminal: 'Mundra International Container Terminal (MICT)',
    trafficLevel: 'Heavy',
    shipsInQueue: 18,
    avgWaitHours: 16.5,
    berthUtilization: '84%',
    recommendedAction: 'Deep draft berth clearance confirmed; adjust speed by -1.2 kts to avoid outer Gulf waiting.',
    fuelSavedTonnes: 18.2,
  },
  INMAA: {
    portName: 'Chennai Port (Madras Harbor)',
    terminal: 'Chennai Container Terminal (CCTL)',
    trafficLevel: 'Moderate',
    shipsInQueue: 9,
    avgWaitHours: 11.0,
    berthUtilization: '70%',
    recommendedAction: 'Pilot boarding at North Channel; berth allocation slot 16:00 UTC.',
    fuelSavedTonnes: 10.4,
  },
  INCOK: {
    portName: 'Cochin Port (Vallarpadam)',
    terminal: 'International Container Transshipment Terminal (ICTT)',
    trafficLevel: 'Normal',
    shipsInQueue: 5,
    avgWaitHours: 6.5,
    berthUtilization: '58%',
    recommendedAction: 'Direct sea channel access; direct berthing window confirmed.',
    fuelSavedTonnes: 8.1,
  },
  // CHINA
  CNSHA: {
    portName: 'Shanghai (Yangshan)',
    terminal: 'Phase IV Automated Deepwater Quay',
    trafficLevel: 'Heavy',
    shipsInQueue: 31,
    avgWaitHours: 24.5,
    berthUtilization: '92%',
    recommendedAction: 'Slow-steam by -1.8 kts to arrive Just-In-Time at Berth #06 and eliminate anchorage idling.',
    fuelSavedTonnes: 28.4,
  },
  SHA: {
    portName: 'Shanghai (Yangshan)',
    terminal: 'Phase IV Automated Deepwater Quay',
    trafficLevel: 'Heavy',
    shipsInQueue: 31,
    avgWaitHours: 24.5,
    berthUtilization: '92%',
    recommendedAction: 'Slow-steam by -1.8 kts to arrive Just-In-Time at Berth #06 and eliminate anchorage idling.',
    fuelSavedTonnes: 28.4,
  },
  // NETHERLANDS
  NLRTM: {
    portName: 'Rotterdam (Maasvlakte)',
    terminal: 'Euromax & APM Terminal 2',
    trafficLevel: 'Moderate',
    shipsInQueue: 14,
    avgWaitHours: 15.0,
    berthUtilization: '82%',
    recommendedAction: 'Reduce speed by -1.1 kts to synchronize pilot boarding at Eurogeul fairway without dropping anchor.',
    fuelSavedTonnes: 16.8,
  },
  RTM: {
    portName: 'Rotterdam (Maasvlakte)',
    terminal: 'Euromax & APM Terminal 2',
    trafficLevel: 'Moderate',
    shipsInQueue: 14,
    avgWaitHours: 15.0,
    berthUtilization: '82%',
    recommendedAction: 'Reduce speed by -1.1 kts to synchronize pilot boarding at Eurogeul fairway without dropping anchor.',
    fuelSavedTonnes: 16.8,
  },
  // SINGAPORE
  SGSIN: {
    portName: 'Singapore (East Anchorage)',
    terminal: 'Tuas Mega Port Phase 1',
    trafficLevel: 'Heavy',
    shipsInQueue: 27,
    avgWaitHours: 19.5,
    berthUtilization: '88%',
    recommendedAction: 'Hold outer Western Anchorage or adjust speed by -1.4 kts to hit allocated 04:00Z bunker window.',
    fuelSavedTonnes: 21.0,
  },
  SIN: {
    portName: 'Singapore (East Anchorage)',
    terminal: 'Tuas Mega Port Phase 1',
    trafficLevel: 'Heavy',
    shipsInQueue: 27,
    avgWaitHours: 19.5,
    berthUtilization: '88%',
    recommendedAction: 'Hold outer Western Anchorage or adjust speed by -1.4 kts to hit allocated 04:00Z bunker window.',
    fuelSavedTonnes: 21.0,
  },
  // UAE
  AEDXB: {
    portName: 'Dubai (Jebel Ali)',
    terminal: 'DP World Terminal 3',
    trafficLevel: 'Normal',
    shipsInQueue: 7,
    avgWaitHours: 8.5,
    berthUtilization: '64%',
    recommendedAction: 'Direct berthing window confirmed. Normal passage speed recommended.',
    fuelSavedTonnes: 6.2,
  },
  DXB: {
    portName: 'Dubai (Jebel Ali)',
    terminal: 'DP World Terminal 3',
    trafficLevel: 'Normal',
    shipsInQueue: 7,
    avgWaitHours: 8.5,
    berthUtilization: '64%',
    recommendedAction: 'Direct berthing window confirmed. Normal passage speed recommended.',
    fuelSavedTonnes: 6.2,
  },
  // USA
  USLAX: {
    portName: 'Los Angeles (San Pedro)',
    terminal: 'Pier 400 APM Terminal',
    trafficLevel: 'Heavy',
    shipsInQueue: 19,
    avgWaitHours: 26.0,
    berthUtilization: '91%',
    recommendedAction: 'Safety queuing zone in effect 150 NM offshore. Virtual arrival slot scheduled.',
    fuelSavedTonnes: 32.0,
  },
  LAX: {
    portName: 'Los Angeles (San Pedro)',
    terminal: 'Pier 400 APM Terminal',
    trafficLevel: 'Heavy',
    shipsInQueue: 19,
    avgWaitHours: 26.0,
    berthUtilization: '91%',
    recommendedAction: 'Safety queuing zone in effect 150 NM offshore. Virtual arrival slot scheduled.',
    fuelSavedTonnes: 32.0,
  },
  // GERMANY
  DEHAM: {
    portName: 'Hamburg (Elbe)',
    terminal: 'Altenwerder CTA Terminal',
    trafficLevel: 'Moderate',
    shipsInQueue: 10,
    avgWaitHours: 11.5,
    berthUtilization: '74%',
    recommendedAction: 'Elbe river draft pilot available. Maintain 12 kts tidal window.',
    fuelSavedTonnes: 9.8,
  },
  HAM: {
    portName: 'Hamburg (Elbe)',
    terminal: 'Altenwerder CTA Terminal',
    trafficLevel: 'Moderate',
    shipsInQueue: 10,
    avgWaitHours: 11.5,
    berthUtilization: '74%',
    recommendedAction: 'Elbe river draft pilot available. Maintain 12 kts tidal window.',
    fuelSavedTonnes: 9.8,
  },
  // BELGIUM
  BEANR: {
    portName: 'Antwerp Gateway',
    terminal: 'Deurganckdock Terminal',
    trafficLevel: 'Normal',
    shipsInQueue: 8,
    avgWaitHours: 9.0,
    berthUtilization: '68%',
    recommendedAction: 'Scheldt pilot assigned; smooth lock entry anticipated.',
    fuelSavedTonnes: 7.5,
  },
  ANR: {
    portName: 'Antwerp Gateway',
    terminal: 'Deurganckdock Terminal',
    trafficLevel: 'Normal',
    shipsInQueue: 8,
    avgWaitHours: 9.0,
    berthUtilization: '68%',
    recommendedAction: 'Scheldt pilot assigned; smooth lock entry anticipated.',
    fuelSavedTonnes: 7.5,
  },
};

export default function PortCallBerthingCard({ destPort, formatCurrency }) {
  const portData = PORT_CALL_TRAFFIC_DATA[destPort?.id] ||
    PORT_CALL_TRAFFIC_DATA[destPort?.id?.slice(2)] ||
    PORT_CALL_TRAFFIC_DATA[destPort?.id?.slice(-3)] || {
      portName: destPort?.name || 'Destination Terminal',
      terminal: `${destPort?.name?.split(' ')[0] || destPort?.country || 'Deepwater'} Marine Gateway`,
      trafficLevel: 'Moderate',
      shipsInQueue: 11,
      avgWaitHours: 13.5,
      berthUtilization: '75%',
      recommendedAction: `Standard pilotage queuing applies at outer anchorage for ${destPort?.name || 'port'}.`,
      fuelSavedTonnes: 12.0,
    };

  // Parking Animation State
  // 'approaching' -> 'turning' -> 'parking' -> 'docked'
  const [parkingPhase, setParkingPhase] = useState('docked');
  const [approachProgress, setApproachProgress] = useState(100); // 0 to 100%
  const [isSimulating, setIsSimulating] = useState(false);
  const [mode, setMode] = useState('dock'); // 'dock' | 'anchor'

  // Run docking parking animation
  useEffect(() => {
    let timer;
    if (isSimulating) {
      if (approachProgress < 100) {
        timer = setTimeout(() => {
          setApproachProgress((prev) => {
            const next = prev + 2;
            if (next >= 100) {
              setIsSimulating(false);
              setParkingPhase('docked');
              return 100;
            }
            if (next > 70) setParkingPhase('parking');
            else if (next > 35) setParkingPhase('turning');
            else setParkingPhase('approaching');
            return next;
          });
        }, 60);
      }
    }
    return () => clearTimeout(timer);
  }, [isSimulating, approachProgress]);

  const startDockingSimulation = () => {
    setMode('dock');
    setApproachProgress(0);
    setParkingPhase('approaching');
    setIsSimulating(true);
  };

  const setAnchorageMode = () => {
    setIsSimulating(false);
    setMode('anchor');
    setApproachProgress(25);
    setParkingPhase('anchored');
  };

  // Calculate distance to quay based on progress
  const distanceToQuay = mode === 'anchor' ? 2400 : Math.max(0, Math.round((100 - approachProgress) * 4.5));
  const currentSpeedKts = mode === 'anchor' ? 0.0 : isSimulating ? ((100 - approachProgress) / 15).toFixed(1) : 0.0;

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <Anchor className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Destination Port Call & Berthing</h3>
            <p className="text-xs text-purple-600 font-medium">{portData.portName}</p>
          </div>
        </div>

        <span
          className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
            portData.trafficLevel === 'Heavy'
              ? 'bg-red-50 border-red-200 text-red-700'
              : portData.trafficLevel === 'Moderate'
              ? 'bg-amber-50 border-amber-200 text-amber-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {portData.trafficLevel} Traffic
        </span>
      </div>

      {/* Traffic Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
          <span className="text-[11px] text-slate-500 block uppercase tracking-wider font-semibold">Queue In Roads</span>
          <span className="text-slate-900 font-bold text-sm">{portData.shipsInQueue} Vessels</span>
        </div>
        <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
          <span className="text-[11px] text-amber-700 block uppercase tracking-wider font-semibold">Anchorage Delay</span>
          <span className="text-amber-900 font-bold text-sm">+{portData.avgWaitHours} Hours</span>
        </div>
        <div className="p-2 rounded-xl bg-purple-50/60 border border-purple-100">
          <span className="text-[11px] text-purple-700 block uppercase tracking-wider font-semibold">Berth Utilization</span>
          <span className="text-purple-900 font-bold text-sm">{portData.berthUtilization}</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE SHIP PARKING / BERTHING ANIMATION CONTAINER   */}
      {/* ========================================================= */}
      <div className="relative rounded-xl bg-slate-950 border border-purple-200 overflow-hidden shadow-inner p-3">
        {/* Dock Overhead Water Canvas */}
        <div className="flex items-center justify-between mb-1.5 text-xs text-slate-300 font-mono">
          <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            BERTH #04 PARKING SLIP
          </span>
          <span className="text-slate-400">
            Dist: <span className="text-white font-bold">{distanceToQuay}m</span> | Spd: <span className="text-purple-300 font-bold">{currentSpeedKts} kts</span>
          </span>
        </div>

        {/* Graphical Dock Layout */}
        <div className="relative h-28 w-full bg-gradient-to-b from-slate-900 via-blue-950/60 to-slate-900 rounded-lg border border-slate-800 overflow-hidden flex flex-col justify-between p-2">
          {/* Subtle water wave lines */}
          <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Top: Concrete Quay Wall / Dock Wall */}
          <div className="relative z-10 w-full h-5 rounded bg-gradient-to-r from-stone-800 via-stone-700 to-stone-800 border-b-2 border-amber-400 flex items-center justify-between px-2 text-[11px] font-mono text-amber-300 font-bold tracking-wider">
            <span>[QUAY CRANE #7]</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-400/40">FENDER LINE</span>
              <span className="text-slate-300">BERTH 04</span>
            </div>
          </div>

          {/* Mooring bollards & guides */}
          <div className="relative flex justify-around px-4 -mt-2 z-10 pointer-events-none">
            <div className="w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-sm" />
            <div className="w-2 h-2 rounded-full bg-amber-400 border border-stone-900 shadow-sm" />
          </div>

          {/* Water Basin / Parking Slot */}
          <div className="relative flex-1 flex items-center justify-center">
            {/* Guide Parking Box (Target Slip) */}
            <div className="absolute top-1/2 -translate-y-1/2 w-44 h-10 border-2 border-dashed border-purple-400/50 rounded-lg flex items-center justify-center pointer-events-none">
              <span className="text-[10px] text-purple-300 font-mono tracking-wider font-semibold">
                Assigned Parking Bay
              </span>
            </div>

            {/* THE ANIMATED VESSEL */}
            {mode === 'anchor' ? (
              <div className="relative z-20 flex flex-col items-center animate-pulse">
                <div className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold text-xs mb-1 shadow-md flex items-center gap-1">
                  <Anchor className="w-3 h-3" />
                  HOLDING AT ANCHORAGE ROAD (18h Delay)
                </div>
                {/* Ship Graphic */}
                <div className="w-34 h-7 bg-purple-700/80 rounded-md border border-purple-300 shadow-lg flex items-center justify-between px-2.5 text-white text-xs font-bold">
                  <span className="text-[11px] text-purple-200 font-mono">SEAQ CARRIER</span>
                  <Anchor className="w-3.5 h-3.5 text-amber-400" />
                </div>
              </div>
            ) : (
              <div
                className="relative z-20 transition-all duration-100 flex items-center justify-center"
                style={{
                  transform: `translateX(${((approachProgress - 100) * 1.5).toFixed(1)}px) translateY(${
                    approachProgress >= 90 ? '0px' : '-4px'
                  }) scale(${0.85 + (approachProgress / 100) * 0.15})`,
                }}
              >
                {/* Ship Body */}
                <div
                  className={`relative w-40 h-8 rounded-lg flex items-center justify-between px-2.5 text-white shadow-xl border transition-colors ${
                    approachProgress >= 98
                      ? 'bg-purple-600 border-purple-300 ring-2 ring-emerald-400'
                      : 'bg-indigo-600 border-purple-400'
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <Ship className="w-3.5 h-3.5 text-purple-200" />
                    <span className="text-[11px] font-bold font-mono">SEAQ HULL</span>
                  </div>

                  {/* Mooring Lines when parked */}
                  {approachProgress >= 98 && (
                    <div className="flex items-center gap-1">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold text-[10px]">
                        BERTHED
                      </span>
                    </div>
                  )}

                  {/* Tugboat indicators during maneuvering */}
                  {isSimulating && approachProgress < 95 && (
                    <div className="absolute -top-4 left-6 px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 text-[9px] font-bold flex items-center gap-0.5 shadow">
                      Tug Assist
                    </div>
                  )}
                </div>

                {/* Radar beam or distance guide */}
                {isSimulating && approachProgress < 95 && (
                  <div className="absolute right-0 w-8 h-8 rounded-full border border-purple-400/40 animate-ping pointer-events-none" />
                )}
              </div>
            )}
          </div>

          {/* Bottom Fairway Guidance */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1 border-t border-slate-800/80">
            <span>HARBOR FAIRWAY #02</span>
            <span className="text-emerald-400 font-semibold">
              {approachProgress >= 98 ? '● SECURED TO QUAY (MOORED)' : isSimulating ? '► PILOT TURNING IN FAIRWAY' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={startDockingSimulation}
              disabled={isSimulating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs shadow transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Simulate Parking</span>
            </button>
            <button
              onClick={setAnchorageMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                mode === 'anchor'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <Anchor className="w-3.5 h-3.5 text-amber-400" />
              <span>Anchorage Hold</span>
            </button>
          </div>

          {approachProgress >= 100 && (
            <button
              onClick={() => {
                setApproachProgress(0);
                startDockingSimulation();
              }}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Reset parking simulation"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Just-In-Time Virtual Arrival Advice */}
      <div className="mt-2.5 p-3 rounded-xl bg-purple-50/80 border border-purple-200 flex items-start gap-2.5 text-xs">
        <CheckCircle2 className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <div className="text-xs leading-relaxed">
          <span className="font-bold text-purple-950 block">Just-In-Time Virtual Arrival Protocol</span>
          <p className="text-slate-700 mt-0.5">{portData.recommendedAction}</p>
          <div className="mt-1.5 flex items-center justify-between text-xs text-purple-900 font-bold">
            <span>Idling Fuel Saved: ~{portData.fuelSavedTonnes} MT</span>
            <span className="text-emerald-700">Cost Avoided: {formatCurrency(Math.round(portData.fuelSavedTonnes * 614))}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
