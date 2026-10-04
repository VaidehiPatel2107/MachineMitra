import React, { useState, useEffect, useCallback } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Gauge,
  MapPin,
  RefreshCw,
  Sliders,
  Sparkles,
  Thermometer,
  Zap,
} from "lucide-react";

const MACHINE_ID = "MM-DRL-001";
const API_BASE   = "http://localhost:8000";

// Static metadata — no backend endpoint owns these fields
const STATIC = {
  id:             MACHINE_ID,
  name:           "CNC Industrial Drilling Machine",
  model:          "Automated Precision Drill Unit",
  location:       "Bay 3 — Precision Fabrication",
  operatingHours: 1840,
};

// Maps backend operational_state → status label shown in the pill badge
function deriveStatusLabel(state) {
  const map = {
    RUNNING_NORMAL:     "Online & Drilling Active",
    IDLE:               "Idle — Motor Spinning",
    OVERHEATING:        "Alert: Thermal Overrun",
    ABNORMAL_VIBRATION: "Alert: Abnormal Vibration",
    OVERLOAD:           "Alert: Motor Overload",
    OFF:                "Offline",
  };
  return map[state] ?? state ?? "Online";
}

export default function FleetOverview({ onNavigateToMachine, onNavigateToReadings, onNavigateToCopilot }) {
  // ── API state ────────────────────────────────────────────────────────────────
  const [healthData, setHealthData] = useState(null);   // /machines/.../health
  const [liveData,   setLiveData]   = useState(null);   // /telemetry/live/...
  const [isLoading,  setIsLoading]  = useState(true);
  const [apiError,   setApiError]   = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [healthRes, liveRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/machines/${MACHINE_ID}/health`),
        fetch(`${API_BASE}/api/v1/telemetry/live/${MACHINE_ID}`),
      ]);

      // Only hard-error when both fail; partial success is still useful
      if (!healthRes.ok && !liveRes.ok) {
        throw new Error(`Backend unreachable (HTTP ${healthRes.status})`);
      }

      if (healthRes.ok) setHealthData(await healthRes.json());
      if (liveRes.ok)   setLiveData(await liveRes.json());
      setApiError(null);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // refresh every 10 s
    return () => clearInterval(interval);
  }, [fetchData]);

  // ── Derived display values ───────────────────────────────────────────────────
  // Health score — from health endpoint
  const healthScore  = healthData ? Math.round(healthData.health_score) : null;

  // Active alarms array — from health endpoint
  const activeAlarms = healthData?.active_alarms ?? [];
  const alertCount   = activeAlarms.length;

  // Status label — from health endpoint's current_status
  const statusLabel  = healthData
    ? deriveStatusLabel(healthData.current_status)
    : "—";

  // Telemetry fields — from live endpoint; show "—" while loading or on error
  const spindleRpm = liveData ? liveData.drillSpeedRpm : "—";
  const temp       = liveData ? liveData.temperature   : "—";
  const vibration  = liveData ? liveData.vibration     : "—";
  const power      = liveData ? liveData.powerKw       : "—";

  // ── Status pill styling — warning colours when an alarm is active ────────────
  const isAlarmed   = activeAlarms.length > 0;
  const pillBg      = isAlarmed ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200";
  const pillDot     = isAlarmed ? "bg-amber-500" : "bg-emerald-500";

  // ── Fleet Health banner sub-label ────────────────────────────────────────────
  const healthSubLabel = healthScore === null
    ? "Fetching…"
    : healthScore >= 80
      ? "Optimal Band"
      : healthScore >= 60
        ? "Monitor Advised"
        : "Degraded — Action Required";
  const healthSubColor = healthScore === null
    ? "text-slate-400"
    : healthScore >= 80
      ? "text-emerald-600"
      : healthScore >= 60
        ? "text-amber-600"
        : "text-rose-600";

  return (
    <div className="w-full space-y-8">

      {/* API Error Banner */}
      {apiError && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>
            <strong>Backend unreachable:</strong> {apiError}. Displaying last successful data or placeholders.
          </span>
          <button
            onClick={fetchData}
            className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100 hover:bg-rose-200 font-semibold transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

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

        {/* 1. Fleet Health */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fleet Health</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {isLoading && healthScore === null ? (
                <span className="inline-block w-12 h-6 rounded bg-slate-100 animate-pulse align-middle" />
              ) : (
                <>{healthScore ?? "—"}%</>
              )}
            </div>
            <span className={`text-xs font-semibold flex items-center gap-1 mt-0.5 ${healthSubColor}`}>
              <CheckCircle2 className="w-3.5 h-3.5" /> {healthSubLabel}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        {/* 2. Active Units — fully static */}
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

        {/* 3. Active Alerts */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Alerts</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {isLoading && !healthData ? (
                <span className="inline-block w-10 h-6 rounded bg-slate-100 animate-pulse align-middle" />
              ) : (
                <>{alertCount} Pending</>
              )}
            </div>
            <span className={`text-xs font-semibold mt-0.5 ${alertCount > 0 ? "text-amber-600" : "text-emerald-600"}`}>
              {alertCount > 0 ? activeAlarms[0] : "Safety parameters normal"}
            </span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Sliders className="w-6 h-6" />
          </div>
        </div>

        {/* 4. Total Power Load */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Power Load</span>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {isLoading && !liveData ? (
                <span className="inline-block w-16 h-6 rounded bg-slate-100 animate-pulse align-middle" />
              ) : (
                <>{power} <span className="text-sm font-normal text-slate-500">kW</span></>
              )}
            </div>
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
                <h3 className="text-2xl font-bold text-slate-900">{STATIC.name}</h3>
                <span className="px-2.5 py-0.5 rounded-md font-mono text-xs bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {STATIC.id}
                </span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${pillBg}`}>
                  <span className={`w-2 h-2 rounded-full animate-pulse ${pillDot}`} />
                  {statusLabel}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1.5 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {STATIC.location}
                </span>
                <span>•</span>
                <span>Model: <strong>{STATIC.model}</strong></span>
                <span>•</span>
                <span>Operating Runtime: <strong>{STATIC.operatingHours} hrs</strong></span>
              </p>
            </div>

            <button
              onClick={() => onNavigateToMachine(STATIC.id)}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-sm shadow-indigo-200 transition-all cursor-pointer group"
            >
              <span>View Details</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Quick Metrics Bar on Card */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">

            {/* Spindle Velocity */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Spindle Velocity</span>
                <Gauge className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {isLoading && !liveData
                  ? <span className="inline-block w-14 h-5 rounded bg-slate-200 animate-pulse" />
                  : <>{spindleRpm} <span className="text-xs font-normal text-slate-400">RPM</span></>
                }
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Feed speed optimal</span>
            </div>

            {/* Head Temperature */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Head Temperature</span>
                <Thermometer className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {isLoading && !liveData
                  ? <span className="inline-block w-14 h-5 rounded bg-slate-200 animate-pulse" />
                  : <>{temp} <span className="text-xs font-normal text-slate-400">°C</span></>
                }
              </div>
              <span className="text-[11px] text-slate-500">Threshold: &lt; 85°C</span>
            </div>

            {/* Vibration Velocity */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Vibration Velocity</span>
                <Activity className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {isLoading && !liveData
                  ? <span className="inline-block w-14 h-5 rounded bg-slate-200 animate-pulse" />
                  : <>{vibration} <span className="text-xs font-normal text-slate-400">mm/s</span></>
                }
              </div>
              <span className="text-[11px] text-emerald-600 font-semibold">Harmonics balanced</span>
            </div>

            {/* Active Load Power */}
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-xs font-medium">Active Load Power</span>
                <Zap className="w-4 h-4 text-indigo-500" />
              </div>
              <div className="text-xl font-black text-slate-900">
                {isLoading && !liveData
                  ? <span className="inline-block w-14 h-5 rounded bg-slate-200 animate-pulse" />
                  : <>{power} <span className="text-xs font-normal text-slate-400">kW</span></>
                }
              </div>
              <span className="text-[11px] text-slate-500">Inverter Balanced</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
