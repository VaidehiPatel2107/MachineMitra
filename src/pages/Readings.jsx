import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  Database, 
  Download, 
  FileText, 
  Gauge, 
  Pause, 
  Play, 
  RefreshCw, 
  Thermometer, 
  TrendingUp, 
  Zap,
  Wifi,
  WifiOff
} from 'lucide-react';

const INITIAL_POINTS = [
  { time: '10s', temp: 63.8, vib: 1.72, rpm: 2840, power: 5.08 },
  { time: '9s',  temp: 64.1, vib: 1.75, rpm: 2842, power: 5.12 },
  { time: '8s',  temp: 64.0, vib: 1.78, rpm: 2845, power: 5.15 },
  { time: '7s',  temp: 64.5, vib: 1.80, rpm: 2850, power: 5.20 },
  { time: '6s',  temp: 64.8, vib: 1.82, rpm: 2852, power: 5.22 },
  { time: '5s',  temp: 65.0, vib: 1.85, rpm: 2848, power: 5.25 },
  { time: '4s',  temp: 64.7, vib: 1.81, rpm: 2855, power: 5.19 },
  { time: '3s',  temp: 64.9, vib: 1.79, rpm: 2850, power: 5.21 },
  { time: '2s',  temp: 65.2, vib: 1.84, rpm: 2846, power: 5.28 },
  { time: 'Now', temp: 64.8, vib: 1.82, rpm: 2850, power: 5.21 },
];

function getSmoothCurvePath(points) {
  if (points.length === 0) return "";
  let d = `M ${points[0].x},${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i < points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
  }
  return d;
}

export default function Readings({ machineId = "MM-DRL-001", onNavigateToFleet }) {
  const [streamPoints, setStreamPoints] = useState(INITIAL_POINTS);
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);
  const [timeframe, setTimeframe] = useState("15m");

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Fetch initial historical logs from FastAPI
  const fetchHistoricalLogs = async () => {
    try {
      const res = await fetch(`http://localhost:8000/api/v1/telemetry/history/${machineId}?limit=15`);
      if (res.ok) {
        const data = await res.json();
        const formatted = data.map(item => ({
          timestamp: new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          temperature: item.temperature,
          vibration: item.vibration,
          drillSpeedRpm: item.drill_speed_rpm,
          powerKw: item.power_kw,
          torqueNm: item.torque_nm,
          status: item.operational_state
        }));
        setLogs(formatted);
      }
    } catch (e) {
      console.warn("Could not fetch historical telemetry:", e);
    }
  };

  useEffect(() => {
    fetchHistoricalLogs();
  }, [machineId]);

  // 2. Connect to FastAPI WebSocket for real-time live wave streaming
  useEffect(() => {
    let ws = null;

    const connectWebSocket = () => {
      ws = new WebSocket(`ws://localhost:8000/ws/telemetry/${machineId}`);

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        if (!isStreaming) return;
        try {
          const packet = JSON.parse(event.data);
          
          // Push new point to sliding waveform window
          setStreamPoints((prev) => {
            const nextPoint = {
              time: packet.timestamp.split(" ")[1] || "Now",
              temp: packet.temperature,
              vib: packet.vibration,
              rpm: packet.drillSpeedRpm,
              power: packet.powerKw,
            };
            return [...prev.slice(1), nextPoint];
          });

          // Add to top of historical logs table
          setLogs((prev) => [
            {
              timestamp: packet.timestamp,
              temperature: packet.temperature,
              vibration: packet.vibration,
              drillSpeedRpm: packet.drillSpeedRpm,
              powerKw: packet.powerKw,
              torqueNm: packet.torqueNm,
              status: packet.status || "NOMINAL",
            },
            ...prev.slice(0, 19)
          ]);
        } catch (err) {
          console.error("Error parsing websocket payload:", err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    };

    connectWebSocket();

    return () => {
      if (ws) ws.close();
    };
  }, [machineId, isStreaming]);

  // Rolling averages calculation
  const averages = useMemo(() => {
    const len = streamPoints.length || 1;
    const sumTemp = streamPoints.reduce((acc, c) => acc + c.temp, 0);
    const sumVib = streamPoints.reduce((acc, c) => acc + c.vib, 0);
    const sumRpm = streamPoints.reduce((acc, c) => acc + c.rpm, 0);
    const sumPower = streamPoints.reduce((acc, c) => acc + c.power, 0);

    return {
      avgTemp: (sumTemp / len).toFixed(1),
      avgVib: (sumVib / len).toFixed(2),
      avgRpm: Math.round(sumRpm / len),
      avgPower: (sumPower / len).toFixed(2),
    };
  }, [streamPoints]);

  const latest = streamPoints[streamPoints.length - 1];

  // Sync to database endpoint call
  const handleSaveToDatabase = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/telemetry/aggregates/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machineId, timeframe })
      });
      if (res.ok) {
        showToast(`Interval averages for ${timeframe} committed to persistent DB.`);
      } else {
        showToast("Sync note: Ingest a few more live readings before saving.");
      }
    } catch {
      showToast("Error connecting to FastAPI backend.");
    }
  };
const renderCurveChart = (title, key, unit, min, max, strokeColor, fillColor, IconComp, currentVal, avgVal) => {
    const svgW = 600;
    const svgH = 175;
    const padLeft = 48;
    const padRight = 20;
    const padTop = 18;
    const padBottom = 32; // Reserves space for the bottom time scale inside the SVG

    const plotW = svgW - padLeft - padRight;
    const plotH = svgH - padTop - padBottom;

    // Coordinate mapping
    const coords = streamPoints.map((pt, idx) => {
      const x = padLeft + (idx / (streamPoints.length - 1)) * plotW;
      const val = pt[key];
      const norm = Math.max(0, Math.min(1, (val - min) / (max - min)));
      const y = (padTop + plotH) - norm * plotH;
      return { x, y, val };
    });

    const smoothLine = getSmoothCurvePath(coords);
    const bottomBaselineY = padTop + plotH;
    const areaPath = `${smoothLine} L ${coords[coords.length - 1].x},${bottomBaselineY} L ${coords[0].x},${bottomBaselineY} Z`;
    const leadingPoint = coords[coords.length - 1];

    const midVal = ((min + max) / 2).toFixed(unit === 'mm/s' ? 1 : 0);

    // 5 evenly spaced time intervals across the exact width of the data plot
    const timeTicks = [
      { label: '-14s', xPos: padLeft },
      { label: '-10s', xPos: padLeft + plotW * 0.25 },
      { label: '-7s',  xPos: padLeft + plotW * 0.50 },
      { label: '-3s',  xPos: padLeft + plotW * 0.75 },
      { label: '0s',   xPos: padLeft + plotW },
    ];

    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
        
        {/* Card Header & Metrics */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center shadow-2xs">
              <IconComp className="w-4 h-4 text-slate-700" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h4>
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                <span>Range: {min} – {max} {unit}</span>
                <span>•</span>
                <span className="text-slate-600 font-medium">Avg: {avgVal} {unit}</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-xl font-black text-slate-900 tracking-tight flex items-baseline justify-end gap-1">
              <span>{currentVal}</span>
              <span className="text-xs font-semibold text-slate-400">{unit}</span>
            </div>
            <div className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 mt-1">
              <TrendingUp className="w-2.5 h-2.5" />
              <span>Realtime Feed</span>
            </div>
          </div>
        </div>

        {/* Oscilloscope Viewport */}
        <div className="w-full h-52 mt-3 bg-[#0b0f19] rounded-xl p-3 relative overflow-hidden flex flex-col justify-between border border-slate-900 select-none">
          
          <svg className="w-full h-full relative z-10" viewBox={`0 0 ${svgW} ${svgH}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id={`curve-grad-${key}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={fillColor} stopOpacity="0.35" />
                <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
              </linearGradient>

              <pattern id="gridPattern" width="40" height="28" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 28" fill="none" stroke="rgba(255, 255, 255, 0.035)" strokeWidth="1" />
              </pattern>
            </defs>

            {/* Grid Pattern Background */}
            <rect x={padLeft} y={padTop} width={plotW} height={plotH} fill="url(#gridPattern)" />

            {/* Top Unit Tag */}
            <text x="8" y="14" fill="#94a3b8" fontSize="10" fontWeight="bold" fontFamily="monospace">
              [{unit}]
            </text>

            {/* Horizontal Grid & Axis Lines */}
            <line x1={padLeft} y1={padTop} x2={padLeft + plotW} y2={padTop} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
            <line x1={padLeft} y1={padTop + plotH / 2} x2={padLeft + plotW} y2={padTop + plotH / 2} stroke="rgba(255, 255, 255, 0.08)" strokeDasharray="3 3" />
            <line x1={padLeft} y1={bottomBaselineY} x2={padLeft + plotW} y2={bottomBaselineY} stroke="rgba(255, 255, 255, 0.2)" />

            {/* Vertical Y Axis Line */}
            <line x1={padLeft} y1={padTop} x2={padLeft} y2={bottomBaselineY} stroke="rgba(255, 255, 255, 0.2)" />

            {/* Vertical Y Ticks & Numbers */}
            <line x1={padLeft - 4} y1={padTop} x2={padLeft} y2={padTop} stroke="rgba(255, 255, 255, 0.3)" />
            <text x={padLeft - 7} y={padTop + 3.5} fill="#cbd5e1" fontSize="9.5" fontWeight="600" textAnchor="end" fontFamily="monospace">{max}</text>

            <line x1={padLeft - 4} y1={padTop + plotH / 2} x2={padLeft} y2={padTop + plotH / 2} stroke="rgba(255, 255, 255, 0.3)" />
            <text x={padLeft - 7} y={padTop + plotH / 2 + 3.5} fill="#94a3b8" fontSize="9.5" textAnchor="end" fontFamily="monospace">{midVal}</text>

            <line x1={padLeft - 4} y1={bottomBaselineY} x2={padLeft} y2={bottomBaselineY} stroke="rgba(255, 255, 255, 0.3)" />
            <text x={padLeft - 7} y={bottomBaselineY + 3.5} fill="#cbd5e1" fontSize="9.5" fontWeight="600" textAnchor="end" fontFamily="monospace">{min}</text>

            {/* Gradient Fill under the Curve */}
            <path d={areaPath} fill={`url(#curve-grad-${key})`} />

            {/* Spline Curve */}
            <path
              d={smoothLine}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Leading Edge Node */}
            <circle
              cx={leadingPoint.x}
              cy={leadingPoint.y}
              r="6.5"
              fill={strokeColor}
              fillOpacity="0.25"
              className="animate-ping"
            />
            <circle
              cx={leadingPoint.x}
              cy={leadingPoint.y}
              r="3.5"
              fill="#ffffff"
              stroke={strokeColor}
              strokeWidth="2.5"
            />

            {/* Geometric Bottom Ticks and Labels aligned to the waveform */}
            {timeTicks.map((t, idx) => (
              <g key={idx}>
                {/* Vertical tick marker at baseline */}
                <line
                  x1={t.xPos}
                  y1={bottomBaselineY}
                  x2={t.xPos}
                  y2={bottomBaselineY + 4}
                  stroke="rgba(255, 255, 255, 0.3)"
                  strokeWidth="1"
                />
                {/* Time value centered below tick */}
                <text
                  x={t.xPos}
                  y={bottomBaselineY + 16}
                  fill={idx === timeTicks.length - 1 ? "#38bdf8" : "#64748b"}
                  fontSize="9.5"
                  fontWeight={idx === timeTicks.length - 1 ? "bold" : "normal"}
                  textAnchor={idx === 0 ? "start" : idx === timeTicks.length - 1 ? "end" : "middle"}
                  fontFamily="monospace"
                >
                  {t.label}
                </text>
              </g>
            ))}
          </svg>

          {/* Clean Status Footer */}
          <div className="relative z-10 flex items-center justify-between text-[10px] font-mono px-1 pt-1 border-t border-slate-900 text-slate-500">
            <span>Buffer: 10 Samples (1.5s step)</span>
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100 Hz SYNCHRONIZED</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6 pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs sm:text-sm border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header with Backend Status Indicator */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <button
            onClick={onNavigateToFleet}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Fleet Command</span>
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Synchronized Multi-Waveform Matrix
            </h1>
            <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
              {machineId}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
              isConnected 
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-rose-50 text-rose-700 border-rose-200'
            }`}>
              {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isConnected ? 'Backend WebSocket Live' : 'Backend Disconnected (Port 8000)'}</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time transducer telemetry stream with rolling harmonic analysis.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer ${
              isStreaming 
                ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{isStreaming ? 'Freeze Stream' : 'Resume Live'}</span>
          </button>

          <button
            onClick={handleSaveToDatabase}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Database className="w-4 h-4" />
            <span>Sync Averages to DB</span>
          </button>
        </div>
      </div>

      {/* 4 Multi-Waveform Curved Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {renderCurveChart('Spindle Angular Velocity', 'rpm', 'RPM', 2600, 3200, '#6366f1', '#4f46e5', Gauge, latest.rpm, averages.avgRpm)}
        {renderCurveChart('Drill Axis Vibration Velocity (RMS)', 'vib', 'mm/s', 1.0, 3.5, '#10b981', '#059669', Activity, latest.vib, averages.avgVib)}
        {renderCurveChart('Cutting Head Thermal Junction', 'temp', '°C', 55, 85, '#f59e0b', '#d97706', Thermometer, latest.temp, averages.avgTemp)}
        {renderCurveChart('Active 3-Phase Spindle Power', 'power', 'kW', 3.5, 8.5, '#8b5cf6', '#7c3aed', Zap, latest.power, averages.avgPower)}
      </div>

      {/* Rolling Averages Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Interval Avg Temp</span>
            <Thermometer className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{averages.avgTemp} °C</div>
          <span className="text-[11px] text-emerald-600 font-medium">Tolerance Nominal</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Interval Avg Vibration</span>
            <Activity className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{averages.avgVib} mm/s</div>
          <span className="text-[11px] text-emerald-600 font-medium">ISO 10816 Band A</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Interval Avg Power</span>
            <Zap className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{averages.avgPower} kW</div>
          <span className="text-[11px] text-slate-500">Inverter Balanced</span>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-medium">Interval Avg RPM</span>
            <Gauge className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{averages.avgRpm} RPM</div>
          <span className="text-[11px] text-emerald-600 font-medium">Feed Rate Calibrated</span>
        </div>
      </div>

      {/* Historical Telemetry Log Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Historical Telemetry Logs (SQLite Feed)</h3>
              <p className="text-xs text-slate-500">Transducer snapshots logged from {machineId}</p>
            </div>
          </div>

          <button
            onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
              const downloadAnchor = document.createElement('a');
              downloadAnchor.setAttribute("href", dataStr);
              downloadAnchor.setAttribute("download", `telemetry_logs_${machineId}.json`);
              document.body.appendChild(downloadAnchor);
              downloadAnchor.click();
              downloadAnchor.remove();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Log</span>
          </button>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3">Temp (°C)</th>
                <th className="py-3 px-3">Vibration (mm/s)</th>
                <th className="py-3 px-3">Spindle (RPM)</th>
                <th className="py-3 px-3">Power (kW)</th>
                <th className="py-3 px-3">Torque (Nm)</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-xs">
              {logs.map((pkt, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-3 text-slate-800 font-semibold flex items-center gap-1.5 font-sans">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{pkt.timestamp}</span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    <span className={pkt.temperature > 67 ? "text-amber-600 font-bold" : ""}>
                      {pkt.temperature}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">
                    <span className={pkt.vibration > 2.1 ? "text-amber-600 font-bold" : ""}>
                      {pkt.vibration}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">{pkt.drillSpeedRpm}</td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">{pkt.powerKw}</td>
                  <td className="py-3.5 px-3 text-slate-700 font-medium">{pkt.torqueNm}</td>
                  <td className="py-3.5 px-3 text-right font-sans">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      pkt.status === "RUNNING_NORMAL" || pkt.status === "NOMINAL"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}>
                      {pkt.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}