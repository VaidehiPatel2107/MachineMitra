import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  Cpu,
  Download,
  Gauge,
  Layers,
  Pause,
  Play,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  Thermometer,
  Wifi,
  Zap
} from 'lucide-react';

// ============================================================================
// DATA SETS & INITIAL TIMEFRAMES
// ============================================================================
const MACHINE_OPTIONS = [
  { id: 'MM-CNC-001', name: 'CNC Machine 01 (MM-CNC-001)', type: '5-Axis Milling Unit' },
  { id: 'MM-LTH-002', name: 'Precision Lathe 02 (MM-LTH-002)', type: 'Heavy Duty Servo Lathe' },
  { id: 'MM-ROB-003', name: 'Robotic Cell A (MM-ROB-003)', type: '6-DOF Articulated Arm' },
];

const TIME_RANGES = {
  '15m': ['10:35', '10:38', '10:41', '10:44', '10:47', '10:50'],
  '50m': ['10:00', '10:10', '10:20', '10:30', '10:40', '10:50'],
  '2h':  ['09:00', '09:25', '09:50', '10:15', '10:35', '10:50'],
  '24h': ['Yesterday', '04:00', '08:00', '12:00', '16:00', 'Now'],
};

const INITIAL_TRENDS = [
  {
    id: 'temp',
    label: 'Core Spindle Temperature',
    unit: '°C',
    color: '#d97706', // amber-600
    fillStart: 'rgba(217, 119, 6, 0.18)',
    fillEnd: 'rgba(217, 119, 6, 0.01)',
    points: {
      '15m': [67.8, 68.0, 68.2, 68.5, 68.1, 68.4],
      '50m': [64.0, 66.2, 65.5, 68.0, 70.1, 68.4],
      '2h':  [62.0, 64.5, 67.0, 68.2, 69.4, 68.4],
      '24h': [58.0, 61.2, 66.4, 71.2, 69.0, 68.4],
    },
    min: 50,
    max: 85,
    safeThreshold: 75.0,
    thresholdLabel: 'Critical Safety Cap: 75.0 °C',
  },
  {
    id: 'vib',
    label: 'Vibration Velocity RMS',
    unit: 'mm/s',
    color: '#0284c7', // sky-600
    fillStart: 'rgba(2, 132, 199, 0.18)',
    fillEnd: 'rgba(2, 132, 199, 0.01)',
    points: {
      '15m': [2.2, 2.3, 2.4, 2.5, 2.3, 2.4],
      '50m': [2.0, 2.2, 2.1, 2.4, 2.3, 2.4],
      '2h':  [1.9, 2.0, 2.2, 2.3, 2.5, 2.4],
      '24h': [1.8, 2.1, 2.6, 2.4, 2.3, 2.4],
    },
    min: 1.0,
    max: 5.0,
    safeThreshold: 3.5,
    thresholdLabel: 'Vibration Limit: 3.5 mm/s',
  },
  {
    id: 'pwr',
    label: 'Active Motor Power',
    unit: 'kW',
    color: '#059669', // emerald-600
    fillStart: 'rgba(5, 150, 105, 0.18)',
    fillEnd: 'rgba(5, 150, 105, 0.01)',
    points: {
      '15m': [4.7, 4.8, 4.8, 4.9, 4.8, 4.8],
      '50m': [4.2, 4.5, 4.6, 4.8, 4.7, 4.8],
      '2h':  [3.8, 4.1, 4.5, 4.8, 4.7, 4.8],
      '24h': [1.2, 3.4, 4.6, 4.9, 4.8, 4.8],
    },
    min: 0,
    max: 8.0,
    safeThreshold: 5.5,
    thresholdLabel: 'Nominal Rating: 5.5 kW',
  },
];

const FIELDBUS_DIAGNOSTICS = [
  {
    name: 'Spindle Thermocouple PT100',
    type: 'Sub-surface Core RTD',
    bus: 'Modbus TCP',
    signal: '-56 dBm',
    latency: '11 ms',
    calibrated: '12 Aug 2026',
    health: 'Optimal',
    statusClass: 'emerald',
  },
  {
    name: 'Piezo Accelerometer ACC-01',
    type: 'Tri-axial Vibration Transducer',
    bus: 'IO-Link v1.1',
    signal: '-60 dBm',
    latency: '7 ms',
    calibrated: '28 Jul 2026',
    health: 'Optimal',
    statusClass: 'emerald',
  },
  {
    name: 'Phase Current & Power Transducer',
    type: 'Hall-Effect CT Module',
    bus: 'RS-485 Serial',
    signal: '-52 dBm',
    latency: '15 ms',
    calibrated: '05 Sep 2026',
    health: 'Optimal',
    statusClass: 'emerald',
  },
  {
    name: 'Optical Rotary Encoder ENC-Z',
    type: 'High-Res Quadrature',
    bus: 'Synchronous SSI',
    signal: '-58 dBm',
    latency: '3 ms',
    calibrated: '15 Jun 2026',
    health: 'Optimal',
    statusClass: 'emerald',
  },
  {
    name: 'Coolant Flow & Sump Sensor',
    type: 'Ultrasonic Hydro-Level',
    bus: 'Analog 4-20 mA',
    signal: 'Direct ADC',
    latency: '2 ms',
    calibrated: '10 May 2026',
    health: 'Attention',
    statusClass: 'amber',
  },
];


// SVG Geometry Helpers
const SVG_W = 340;
const SVG_H = 100;
const SVG_PAD_Y = 12;

function getCoordinates(points, min, max) {
  const range = max - min || 1;
  return points.map((val, i) => {
    const x = (i / (points.length - 1)) * SVG_W;
    const y = SVG_H - SVG_PAD_Y - ((val - min) / range) * (SVG_H - SVG_PAD_Y * 2);
    return { x: Number(x.toFixed(1)), y: Number(y.toFixed(1)), val };
  });
}

function buildSmoothPath(coords) {
  if (coords.length === 0) return '';
  let d = `M ${coords[0].x},${coords[0].y}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[i === 0 ? i : i - 1];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[i + 2 < coords.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

function buildAreaPath(coords, smoothCurve) {
  if (coords.length === 0) return '';
  const first = coords[0];
  const last = coords[coords.length - 1];
  return `${smoothCurve} L ${last.x},${SVG_H} L ${first.x},${SVG_H} Z`;
}

function WaveformCard({ trend, timeRange, timeLabels, isAnomaly }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  // Apply subtle upward shift if anomaly simulation is active
  const basePoints = trend.points[timeRange];
  const points = useMemo(() => {
    if (!isAnomaly) return basePoints;
    if (trend.id === 'temp') return basePoints.map((p, idx) => (idx >= 3 ? +(p + 10.5).toFixed(1) : p));
    if (trend.id === 'vib') return basePoints.map((p, idx) => (idx >= 3 ? +(p + 1.8).toFixed(2) : p));
    return basePoints;
  }, [basePoints, isAnomaly, trend.id]);

  const coords = useMemo(() => getCoordinates(points, trend.min, trend.max), [points, trend.min, trend.max]);
  const smoothLine = useMemo(() => buildSmoothPath(coords), [coords]);
  const areaFill = useMemo(() => buildAreaPath(coords, smoothLine), [coords, smoothLine]);

  // Compute horizontal threshold indicator Y
  const thresholdY = useMemo(() => {
    const range = trend.max - trend.min;
    return SVG_H - SVG_PAD_Y - ((trend.safeThreshold - trend.min) / range) * (SVG_H - SVG_PAD_Y * 2);
  }, [trend.safeThreshold, trend.min, trend.max]);

  const activeValue = hoverIndex !== null ? points[hoverIndex] : points[points.length - 1];
  const activeTime = hoverIndex !== null ? timeLabels[hoverIndex] : 'Latest Realtime';
  const isOverTolerance = activeValue >= trend.safeThreshold;

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between">
      <div>
        {/* Top Header of Card */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {trend.label}
              </span>
              {isOverTolerance && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                  Over Threshold
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
              {trend.thresholdLabel}
            </div>
          </div>

          <div className="text-right">
            <div
              className={`text-xl font-bold tracking-tight ${
                isOverTolerance ? 'text-amber-700' : 'text-slate-900'
              }`}
            >
              {activeValue} <span className="text-xs font-normal text-slate-400">{trend.unit}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-mono">{activeTime}</span>
          </div>
        </div>

        {/* SVG Sparkline Container */}
        <div className="relative w-full h-[100px] mt-2 select-none">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            preserveAspectRatio="none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={`grad-${trend.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={trend.color} stopOpacity="0.22" />
                <stop offset="100%" stopColor={trend.color} stopOpacity="0.01" />
              </linearGradient>
            </defs>

            {/* Threshold Guideline */}
            <line
              x1="0"
              y1={thresholdY}
              x2={SVG_W}
              y2={thresholdY}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              strokeWidth="1"
            />

            {/* Gradient Fill */}
            <path d={areaFill} fill={`url(#grad-${trend.id})`} />

            {/* Main Smooth Line */}
            <path
              d={smoothLine}
              fill="none"
              stroke={trend.color}
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Interactive Crosshair & Nodes */}
            {coords.map((pt, idx) => (
              <g key={idx}>
                {hoverIndex === idx && (
                  <>
                    <line
                      x1={pt.x}
                      y1="0"
                      x2={pt.x}
                      y2={SVG_H}
                      stroke="#94a3b8"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r="4.5"
                      fill="#ffffff"
                      stroke={trend.color}
                      strokeWidth="2.5"
                    />
                  </>
                )}
                <rect
                  x={pt.x - 18}
                  y="0"
                  width="36"
                  height={SVG_H}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Axis Footer */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-3 border-t border-slate-100 font-mono mt-2">
        {timeLabels.map((time, i) => (
          <span
            key={i}
            className={`transition-colors ${
              hoverIndex === i ? 'text-indigo-600 font-bold' : 'text-slate-400'
            }`}
          >
            {time}
          </span>
        ))}
      </div>
    </div>
  );
}


export default function Readings({ onNavigateToFleet, onNavigateToMachine, onNavigateToCopilot }) {
  const [selectedMachineId, setSelectedMachineId] = useState('MM-CNC-001');
  const [timeRange, setTimeRange] = useState('50m'); // '15m' | '50m' | '2h' | '24h'
  const [isStreaming, setIsStreaming] = useState(true);
  const [isAnomalySimulated, setIsAnomalySimulated] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Real-time sensor metrics
  const [liveSensors, setLiveSensors] = useState({
    temperature: 68.2,
    vibration: 2.4,
    power: 4.8,
    rpm: 1450,
    current: 8.2,
  });

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Live buffer tick simulation when streaming is active
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      setLiveSensors((prev) => {
        const deltaTemp = (Math.random() - 0.49) * 0.3;
        const deltaVib = (Math.random() - 0.49) * 0.08;
        const deltaPower = (Math.random() - 0.49) * 0.1;

        return {
          temperature: +(isAnomalySimulated ? 79.4 + deltaTemp : 68.2 + deltaTemp).toFixed(1),
          vibration: +(isAnomalySimulated ? 4.1 + deltaVib : 2.4 + deltaVib).toFixed(2),
          power: +(isAnomalySimulated ? 6.2 + deltaPower : 4.8 + deltaPower).toFixed(1),
          rpm: Math.round(1445 + Math.random() * 12),
          current: +(8.2 + (Math.random() - 0.5) * 0.2).toFixed(1),
        };
      });
    }, 1800);

    return () => clearInterval(interval);
  }, [isStreaming, isAnomalySimulated]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const timestamps = TIME_RANGES[timeRange];
    const rows = [
      ['Timestamp', 'Machine ID', 'Core Temperature (°C)', 'Vibration RMS (mm/s)', 'Active Power (kW)', 'RPM', 'Phase Current (A)'],
      ...timestamps.map((t, idx) => [
        t,
        selectedMachineId,
        (66 + idx * 0.5).toFixed(1),
        (2.1 + idx * 0.06).toFixed(2),
        (4.6 + idx * 0.05).toFixed(1),
        '1450',
        '8.2',
      ]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `MachineMitra_Telemetry_${selectedMachineId}_${timeRange}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    triggerToast(`Telemetry log exported for ${selectedMachineId} (${timeRange}).`);
  };

  const handleToggleAnomaly = () => {
    const nextState = !isAnomalySimulated;
    setIsAnomalySimulated(nextState);
    if (nextState) {
      triggerToast('Simulated thermal and vibration anomaly injected into telemetry stream.');
    } else {
      triggerToast('Telemetry stream returned to baseline operational nominal.');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-16">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl shadow-slate-900/10 flex items-center gap-2.5 text-xs sm:text-sm animate-bounce-short border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Header Navigation Strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <button
                onClick={onNavigateToFleet}
                className="hover:text-slate-800 transition-colors cursor-pointer"
              >
                Fleet Command
              </button>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Real-Time Sensor Readings</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Real-Time Telemetry & Waveforms
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                <span>{isStreaming ? 'MQTT Buffer: 100 Hz Live' : 'Buffer Paused'}</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              High-frequency multi-axis oscillation feeds, thermal envelope spectrum, and fieldbus diagnostics.
            </p>
          </div>

          {/* Quick Nav Shortcut */}
          {onNavigateToCopilot && (
            <button
              onClick={onNavigateToCopilot}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/70 transition-colors shadow-2xs self-start md:self-auto cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Ask Copilot to Analyze Waves</span>
            </button>
          )}
        </div>

        {/* 1. CONTROL & TELEMETRY STRIP */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-6 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-xs">
          {/* Machine Selection Dropdown */}
          <div className="flex items-center gap-3 flex-wrap">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Active Unit:
            </label>
            <div className="relative">
              <select
                value={selectedMachineId}
                onChange={(e) => setSelectedMachineId(e.target.value)}
                className="appearance-none bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2 pr-9 text-xs sm:text-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 cursor-pointer transition-all"
              >
                {MACHINE_OPTIONS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Stream Control Action Group */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Pause / Resume Button */}
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border shadow-2xs cursor-pointer ${
                isStreaming
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200/90'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-emerald-200'
              }`}
            >
              {isStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5 text-slate-500" />
                  <span>Pause Stream</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-white" />
                  <span>Resume Stream</span>
                </>
              )}
            </button>

            {/* CSV Export Button */}
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer"
              title="Download telemetry readings as CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>Export Telemetry (CSV)</span>
            </button>

            {/* Anomaly Simulation Toggle */}
            <button
              onClick={handleToggleAnomaly}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border shadow-2xs cursor-pointer ${
                isAnomalySimulated
                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              <AlertTriangle className={`w-3.5 h-3.5 ${isAnomalySimulated ? 'text-rose-600' : 'text-slate-500'}`} />
              <span>{isAnomalySimulated ? 'Clear Anomaly' : 'Simulate Anomaly'}</span>
            </button>
          </div>
        </div>

        {/* 2. TIME HORIZON SELECTOR */}
        <div className="flex items-center justify-between mt-6 mb-3 flex-wrap gap-2">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Interactive Trend Waveforms
            </h2>
            <p className="text-xs text-slate-500">
              Hover across chart curves to inspect synchronized point timestamps and values.
            </p>
          </div>

          {/* Segmented Range Controls */}
          <div className="inline-flex p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl">
            {Object.keys(TIME_RANGES).map((rangeKey) => (
              <button
                key={rangeKey}
                onClick={() => setTimeRange(rangeKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  timeRange === rangeKey
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Last {rangeKey}
              </button>
            ))}
          </div>
        </div>


        {/* 3. INTERACTIVE TREND WAVEFORM CHARTS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {INITIAL_TRENDS.map((trend) => (
            <WaveformCard
              key={trend.id}
              trend={trend}
              timeRange={timeRange}
              timeLabels={TIME_RANGES[timeRange]}
              isAnomaly={isAnomalySimulated}
            />
          ))}
        </div>

        {/* 4. INSTANT SENSOR MATRIX TILES */}
        <div className="mt-8">
          <div className="mb-3">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Instantaneous Sensor Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Calibrated engineering units mapped with active upper tolerance tracks.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
            {/* Tile 1: Temp */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Spindle Temp</span>
                <Thermometer className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {liveSensors.temperature} <span className="text-xs font-normal text-slate-400">°C</span>
              </div>
              <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    liveSensors.temperature > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (liveSensors.temperature / 100) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Threshold: &lt; 75.0 °C</span>
                <span className={liveSensors.temperature > 75 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                  {liveSensors.temperature > 75 ? 'Warning' : 'Optimal'}
                </span>
              </div>
            </div>

            {/* Tile 2: Vibration */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Vibration RMS</span>
                <Activity className="w-3.5 h-3.5 text-sky-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {liveSensors.vibration} <span className="text-xs font-normal text-slate-400">mm/s</span>
              </div>
              <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    liveSensors.vibration > 3.5 ? 'bg-amber-500' : 'bg-sky-500'
                  }`}
                  style={{ width: `${Math.min(100, (liveSensors.vibration / 5) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Tolerance: &lt; 3.5</span>
                <span className={liveSensors.vibration > 3.5 ? 'text-amber-700 font-bold' : 'text-emerald-700'}>
                  {liveSensors.vibration > 3.5 ? 'Elevated' : 'Nominal'}
                </span>
              </div>
            </div>

            {/* Tile 3: Power */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Active Power</span>
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {liveSensors.power} <span className="text-xs font-normal text-slate-400">kW</span>
              </div>
              <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (liveSensors.power / 10) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Rated: 8.0 kW</span>
                <span className="text-emerald-700 font-semibold">Balanced</span>
              </div>
            </div>

            {/* Tile 4: RPM */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Spindle Speed</span>
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {liveSensors.rpm} <span className="text-xs font-normal text-slate-400">RPM</span>
              </div>
              <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${Math.min(100, (liveSensors.rpm / 2000) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Target: 1450 RPM</span>
                <span className="text-indigo-700 font-semibold">Locked</span>
              </div>
            </div>

            {/* Tile 5: Current */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider">Phase Current</span>
                <Cpu className="w-3.5 h-3.5 text-slate-500" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-slate-900">
                {liveSensors.current} <span className="text-xs font-normal text-slate-400">A</span>
              </div>
              <div className="mt-2.5 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-slate-700 transition-all duration-500"
                  style={{ width: `${Math.min(100, (liveSensors.current / 15) * 100)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between text-[10px] text-slate-400 font-medium">
                <span>Max Draw: 15.0 A</span>
                <span className="text-slate-700 font-semibold">Stable</span>
              </div>
            </div>
          </div>
        </div>


        {/* 5. SENSOR FIELDBUS DIAGNOSTICS TABLE */}
        <div className="mt-8">
          <div className="flex items-center justify-between pb-3 mb-2 flex-wrap gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                Sensor Fieldbus Diagnostics & Signal Quality
              </h3>
              <p className="text-xs text-slate-500">
                Transducer physical health, edge broker link latency, and calibration audit tracking.
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Gateway Topology: Star Mesh (Zero Loss)</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Sensor Unit</th>
                    <th className="py-3 px-4">Bus Interface</th>
                    <th className="py-3 px-4">Signal Quality</th>
                    <th className="py-3 px-4">Latency</th>
                    <th className="py-3 px-4">Last Calibration</th>
                    <th className="py-3 px-4 text-right">Node Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {FIELDBUS_DIAGNOSTICS.map((node) => (
                    <tr key={node.name} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-800">{node.name}</div>
                        <div className="text-[11px] text-slate-400">{node.type}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          {node.bus}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">{node.signal}</td>
                      <td className="py-3 px-4 font-mono text-slate-600">{node.latency}</td>
                      <td className="py-3 px-4 text-slate-500">{node.calibrated}</td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            node.statusClass === 'emerald'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              node.statusClass === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          {node.health}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 6. CLEAN NAVIGATION FOOTER & BACKLINKS */}
        <div className="mt-8 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={onNavigateToMachine}
            className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Machine Overview</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onNavigateToFleet}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
            >
              Fleet Command Center
            </button>
            <button
              onClick={onNavigateToCopilot}
              className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <span>Launch Factory Copilot</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}