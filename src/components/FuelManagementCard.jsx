import React, { useState } from 'react';
import { Flame, Sliders, Check, Info, ShieldCheck, ChevronDown, ChevronUp, Zap } from 'lucide-react';

// THE 6 SPECIFIC MARINE FUELS SPECIFIED BY THE USER
export const MARINE_FUELS_LIST = [
  {
    id: 'DIESEL',
    name: 'Marine Diesel (MGO / MDO)',
    shortName: 'Marine Diesel',
    type: 'Low-Sulfur Distillate',
    carbonFactor: 3.206, // tCO2 / MT fuel
    baseUsdPerMt: 780,
    calorificMjKg: 42.7,
    isDualFuelReady: true,
    isPilotEligible: true,
    sulfurContent: '0.10% (ECA Compliant)',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Refined distillate oil with minimal particulate soot. Standard for auxiliary engines and pilot ignition.',
  },
  {
    id: 'PETROL_BUNKER',
    name: 'Marine Petrol / Fuel Oil (VLSFO)',
    shortName: 'Marine Petrol (VLSFO)',
    type: 'Heavy Bunker Residual',
    carbonFactor: 3.114,
    baseUsdPerMt: 614,
    calorificMjKg: 41.2,
    isDualFuelReady: false,
    isPilotEligible: false,
    sulfurContent: '0.50% (IMO Cap)',
    badgeColor: 'bg-slate-200 text-slate-800 border-slate-300',
    description: 'Conventional global bunker fuel oil for large 2-stroke diesel prime movers.',
  },
  {
    id: 'HYDROGEN',
    name: 'Liquid Hydrogen (LH₂)',
    shortName: 'Hydrogen',
    type: 'Zero-Carbon Cryogenic',
    carbonFactor: 0.00, // 0 tCO2 tailpipe
    baseUsdPerMt: 2150,
    calorificMjKg: 120.0,
    isDualFuelReady: true,
    isPilotEligible: false,
    sulfurContent: '0.00% (Zero Emissions)',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'True zero-tailpipe carbon fuel; stored cryogenically at -253°C with highest specific energy density.',
  },
  {
    id: 'AMMONIA',
    name: 'Green Ammonia (NH₃)',
    shortName: 'Ammonia',
    type: 'Zero-Carbon Chemical Carrier',
    carbonFactor: 0.00,
    baseUsdPerMt: 860,
    calorificMjKg: 18.6,
    isDualFuelReady: true,
    isPilotEligible: false,
    sulfurContent: '0.00% (Zero Carbon)',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Zero-carbon molecule derived from green hydrogen; requires 5-10% pilot diesel injection for compression ignition.',
  },
  {
    id: 'METHANOL',
    name: 'Green E-Methanol (CH₃OH)',
    shortName: 'Methanol',
    type: 'Renewable Liquid Alcohol',
    carbonFactor: 0.28, // Net lifecycle biogenic
    baseUsdPerMt: 680,
    calorificMjKg: 19.9,
    isDualFuelReady: true,
    isPilotEligible: false,
    sulfurContent: '0.00% (Soot-Free)',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Liquid synthetic fuel ambient at sea level. Adopted by Maersk & CMA CGM, cutting lifecycle GHGs by up to 92%.',
  },
  {
    id: 'LNG',
    name: 'Liquefied Natural Gas (LNG)',
    shortName: 'LNG Methane',
    type: 'Cryogenic Methane',
    carbonFactor: 2.75,
    baseUsdPerMt: 590,
    calorificMjKg: 49.0,
    isDualFuelReady: true,
    isPilotEligible: false,
    sulfurContent: '0.00% (Near-Zero SOx)',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Cryogenic natural gas at -162°C. Reduces CO₂ by 23%, eliminating sulfur oxides and 85% of NOx.',
  },
];

export default function FuelManagementCard({
  selectedFuelId,
  onSelectFuel,
  isDualFuel,
  onToggleDualFuel,
  pilotDieselPercent,
  onChangePilotRatio,
  formatCurrency,
}) {
  const [showFuelDropdown, setShowFuelDropdown] = useState(false);
  const [showDualFuelExplainer, setShowDualFuelExplainer] = useState(false);

  const currentFuel = MARINE_FUELS_LIST.find((f) => f.id === selectedFuelId) || MARINE_FUELS_LIST[0];
  const marineDiesel = MARINE_FUELS_LIST[0]; // MGO

  // Blended calculations when dual fuel is active
  const blendedCarbonFactor = isDualFuel
    ? Number(
        (
          (1 - pilotDieselPercent / 100) * currentFuel.carbonFactor +
          (pilotDieselPercent / 100) * marineDiesel.carbonFactor
        ).toFixed(2)
      )
    : currentFuel.carbonFactor;

  const blendedPriceUsd = isDualFuel
    ? Math.round(
        (1 - pilotDieselPercent / 100) * currentFuel.baseUsdPerMt +
          (pilotDieselPercent / 100) * marineDiesel.baseUsdPerMt
      )
    : currentFuel.baseUsdPerMt;

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Marine Fuel & Dual-Fuel Engine</h3>
            <p className="text-[10px] text-purple-600 font-medium">Bunker specification and injection mode</p>
          </div>
        </div>

        {/* Dual Fuel Indicator Badge */}
        <button
          onClick={() => onToggleDualFuel(!isDualFuel)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
            isDualFuel
              ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Toggle Dual-Fuel Engine Mode"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Dual-Fuel: {isDualFuel ? 'ACTIVE' : 'OFF'}</span>
        </button>
      </div>

      {/* Fuel Selector Dropdown */}
      <div className="relative mb-3">
        <label className="block text-xs font-semibold text-slate-700 mb-1">
          Active Bunkered Fuel Type
        </label>
        <button
          type="button"
          onClick={() => setShowFuelDropdown(!showFuelDropdown)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-purple-50/50 hover:bg-purple-50 border border-purple-200 text-left text-xs text-slate-800 flex items-center justify-between transition-colors"
        >
          <div>
            <span className="font-bold text-slate-900 text-sm">{currentFuel.name}</span>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span>{currentFuel.type}</span>
              <span>•</span>
              <span className="text-purple-700 font-bold">{formatCurrency(currentFuel.baseUsdPerMt)} / MT</span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-purple-600 shrink-0" />
        </button>

        {showFuelDropdown && (
          <div className="absolute top-full left-0 right-0 mt-1.5 max-h-56 overflow-y-auto rounded-xl bg-white border border-purple-200 shadow-2xl z-50 p-1.5 space-y-1">
            {MARINE_FUELS_LIST.map((fuel) => {
              const isSelected = fuel.id === currentFuel.id;
              return (
                <button
                  key={fuel.id}
                  onClick={() => {
                    onSelectFuel(fuel.id);
                    setShowFuelDropdown(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    isSelected ? 'bg-purple-50 text-purple-900 font-bold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{fuel.name}</span>
                      {fuel.carbonFactor === 0 && (
                        <span className="px-1.5 py-0.2 rounded bg-cyan-100 text-cyan-800 text-[10px] font-bold">
                          Zero Carbon
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">{fuel.description}</span>
                  </div>
                  <div className="text-right pl-2 shrink-0">
                    <span className="text-xs font-bold text-purple-700">{formatCurrency(fuel.baseUsdPerMt)}</span>
                    <span className="text-[11px] text-slate-400 block">{fuel.carbonFactor} tCO₂/t</span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* DUAL-FUEL ENGINE CONTROLS & EXPLANATION */}
      {isDualFuel ? (
        <div className="p-3 rounded-xl bg-purple-50/80 border border-purple-200 mb-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-purple-700" />
              <span className="text-xs font-bold text-purple-950">Dual-Fuel Blend Ratio</span>
            </div>
            <button
              onClick={() => setShowDualFuelExplainer(!showDualFuelExplainer)}
              className="text-xs text-purple-700 hover:text-purple-900 underline flex items-center gap-0.5 font-medium"
            >
              <span>Why Dual Fuel?</span>
              {showDualFuelExplainer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Explanation drawer */}
          {showDualFuelExplainer && (
            <div className="p-3 rounded-xl bg-white border border-purple-100 text-xs text-slate-700 leading-relaxed shadow-sm">
              <p className="font-bold text-purple-900 mb-1">
                How Dual-Fuel Maritime Engines Operate:
              </p>
              Alternative clean fuels like Methanol, LNG, Ammonia, or Hydrogen have low cetane numbers and cannot self-ignite under standard diesel compression. Marine engines (e.g. WinGD X-DF or MAN ME-LGI) inject <strong>5% to 10% Marine Diesel</strong> as a pilot flame to trigger combustion, and retain the capability to run 100% on Marine Diesel if alternative bunkering is unavailable.
            </div>
          )}

          {/* Ratio Slider */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1">
              <span className="text-purple-900">
                Primary ({currentFuel.shortName}): <span className="font-black">{100 - pilotDieselPercent}%</span>
              </span>
              <span className="text-blue-700">
                Pilot Ignition: <span className="font-black">{pilotDieselPercent}%</span>
              </span>
            </div>
            <input
              type="range"
              min="5"
              max="25"
              step="1"
              value={pilotDieselPercent}
              onChange={(e) => onChangePilotRatio(Number(e.target.value))}
              className="w-full accent-purple-600 cursor-pointer h-2 bg-purple-200 rounded-lg"
            />
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>5% (High Clean)</span>
              <span>10% (Standard)</span>
              <span>25% (High Torque)</span>
            </div>
          </div>

          {/* Blended Specs Summary */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-purple-100">
            <div>
              <span className="text-slate-500 block text-[11px]">Blended Carbon Factor:</span>
              <span className="text-purple-950 font-bold text-sm">{blendedCarbonFactor} tCO₂ / MT</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Blended Bunker Cost:</span>
              <span className="text-slate-900 font-bold text-sm">{formatCurrency(blendedPriceUsd)} / MT</span>
            </div>
          </div>
        </div>
      ) : (
        /* Single Fuel Details Pill */
        <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs mb-2 text-center">
          <div>
            <span className="text-slate-400 block text-[11px]">CO₂ Intensity</span>
            <span className="font-bold text-slate-800 text-sm">{currentFuel.carbonFactor} t/t</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Sulfur Cap</span>
            <span className="font-bold text-slate-800 text-sm">{currentFuel.sulfurContent}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Energy MJ/kg</span>
            <span className="font-bold text-slate-800 text-sm">{currentFuel.calorificMjKg}</span>
          </div>
        </div>
      )}
    </div>
  );
}
