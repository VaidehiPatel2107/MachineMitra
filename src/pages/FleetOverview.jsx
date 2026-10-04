import React from "react";
import { 
  Activity, 
  ArrowRight, 
  CheckCircle2, 
  Cpu, 
  Gauge, 
  MapPin, 
  Sliders, 
  Sparkles, 
  Thermometer, 
  Zap 
} from "lucide-react";

export default function FleetOverview({ onNavigateToMachine, onNavigateToReadings, onNavigateToCopilot }) {
  const drillerData = {
    id: "MM-DRL-001",
    name: "CNC Industrial Drilling Machine",
    model: "Automated Precision Drill Unit",
    location: "Bay 3 — Precision Fabrication",
    status: "running",
    statusLabel: "Online & Drilling Active",
    health: 93,
    operatingHours: 1840,
    spindleRpm: 2850,
    temp: 64.8,
    vibration: 1.8,
    power: 5.2,
  };

  return (
    <div className="w-full space-y-8">
      {/* Fleet Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Production Fleet Dashboard
            </h1>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
              Prototype Station
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time sensory telemetry acquisition for automated precision manufacturing equipment.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateToReadings && onNavigateToReadings()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200/90 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Activity className="w-4 h-4 text-indigo-600" />
            <span>Open Waveform Stream</span>
          </button>
          <button
            onClick={() => onNavigateToCopilot && onNavigateToCopilot()}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consult Copilot</span>
          </button>
        </div>
      </div>

      {/* Fleet Summary Banners */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Health</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{drillerData.health}%</div>
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Optimal Band
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Units</span>
            <div className="text-2xl font-black text-slate-900 mt-1">1 / 1 Unit</div>
            <span className="text-xs text-slate-500 font-medium mt-0.5">MM-DRL-001 connected</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Cpu className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Alerts</span>
            <div className="text-2xl font-black text-slate-900 mt-1">0 Pending</div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5">Safety parameters normal</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
        </div>

        {/* 4th Card restored to Power / Energy Consumption */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Power Load</span>
            <div className="text-2xl font-black text-slate-900 mt-1">{drillerData.power} kW</div>
            <span className="text-xs text-emerald-600 font-semibold mt-0.5">3-Phase Inverter Balanced</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Zap className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Single Machine Focus Card */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Monitored Assets</h2>
            <p className="text-xs text-slate-500">Live operational telemetry feed</p>
          </div>
          <span className="text-xs font-medium text-slate-400">1 Unit Active</span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm hover:border-indigo-300 transition-all">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-2xl font-bold text-slate-900">{drillerData.name}</h3>
                <span className="px-2.5 py-0.5 rounded-md font-mono text-xs bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {drillerData.id}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  {drillerData.statusLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {drillerData.location}
                </span>
                <span>•</span>
                <span>Model: <strong>{drillerData.model}</strong></span>
                <span>•</span>
                <span>Operating Runtime: <strong>{drillerData.operatingHours} hrs</strong></span>
              </p>
            </div>

            <button
              onClick={() => onNavigateToMachine(drillerData.id)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer group"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Metrics Bar on Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Spindle Velocity</span>
                <Gauge className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {drillerData.spindleRpm} <span className="text-xs font-normal text-slate-400">RPM</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Feed speed optimal</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Head Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {drillerData.temp} <span className="text-xs font-normal text-slate-400">°C</span>
              </div>
              <span className="text-[11px] text-slate-500">Threshold: &lt; 85°C</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Vibration Velocity</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {drillerData.vibration} <span className="text-xs font-normal text-slate-400">mm/s</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Harmonics balanced</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Active Load Power</span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {drillerData.power} <span className="text-xs font-normal text-slate-400">kW</span>
              </div>
              <span className="text-[11px] text-slate-500">Inverter Balanced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}