import React, { useState } from 'react';
import { DollarSign, ShieldAlert, Award, TrendingUp, ChevronDown, ChevronUp, Sparkles, CheckCircle } from 'lucide-react';

export default function CommercialRoiCard({ formatCurrency }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white/95 backdrop-blur-md border border-purple-100 p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">Commercial Fleet ROI &amp; Value</h3>
            <p className="text-[10px] text-emerald-600 font-semibold">Why Shipowners &amp; Charterers Use SEAQ</p>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-purple-700 transition-colors p-1"
        >
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* QUICK SUMMARY METRICS BAR */}
      <div className="grid grid-cols-2 gap-2 mt-3 mb-2">
        <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
          <span className="text-[10px] text-slate-500 block">Direct Fuel Burn Saved</span>
          <span className="text-xs font-bold text-emerald-700">$68,400 - $180,000</span>
          <span className="text-[9px] text-slate-500 block">Per ocean voyage</span>
        </div>
        <div className="p-2 rounded-xl bg-purple-50/70 border border-purple-100">
          <span className="text-[10px] text-slate-500 block">PSC Detention Avoided</span>
          <span className="text-xs font-bold text-purple-800">$50,000 - $100,000</span>
          <span className="text-[9px] text-slate-500 block">Per day in off-hire loss</span>
        </div>
      </div>

      {isOpen && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2.5 animate-in fade-in duration-200 text-[11px] text-slate-600 leading-relaxed">
          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">1. Prevents Catastrophic Port Detention</strong>
              IMO does not bill tax invoices, but non-compliant ships (Grade D/E) lose their Statement of Compliance. Port State Control (PSC) detains the vessel at port, causing massive $50k–$100k daily off-hire penalties.
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">2. Cuts 50-60% of Total Voyage Cost</strong>
              Marine bunker fuel is the single largest operating expense in global shipping. AI weather routing and XGBoost RPM optimization cuts fuel burn by 14%, directly boosting operating profit.
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <Award className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">3. BIMCO Charterparty Compliance</strong>
              Global charter contracts legally require charterers to maintain minimum Grade C ratings. SEAQ voyage planning provides verified legal proof of compliance.
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800 block">4. Statutory European EU ETS Tax</strong>
              Any voyage touching Europe faces legally binding statutory EUA cash allowances (~€90/t) which SEAQ reduces by up to 22%.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
