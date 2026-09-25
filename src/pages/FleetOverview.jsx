import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Filter,
  Plus,
  Search,
  SlidersHorizontal,
  Wrench,
  Zap,
  Thermometer,
  Layers,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  X,
  Clock,
  MapPin,
  Shield,
  ChevronRight,
  Sparkles,
  Info
} from 'lucide-react';

// Initial Fleet Mock Data
const INITIAL_FLEET = [
  {
    id: 'MM-CNC-001',
    name: 'CNC Machine 01',
    type: '5-Axis Milling Unit',
    location: 'Bay 4 — Production Floor',
    health: 94,
    status: 'running',
    statusLabel: 'Operating Nominal',
    lastSync: 'Just now',
    calibrationInterval: '300 hrs',
    readings: {
      temperature: 68.2,
      vibration: 2.1,
      power: 4.8,
      uptime: '18h 42m',
    },
    alertsCount: 0,
  },
  {
    id: 'MM-LTH-002',
    name: 'Precision Lathe 02',
    type: 'Heavy Duty Servo Lathe',
    location: 'Bay 2 — Precision Machining',
    health: 76,
    status: 'warning',
    statusLabel: 'Thermal Advisory',
    lastSync: '1m ago',
    calibrationInterval: '250 hrs',
    readings: {
      temperature: 78.4,
      vibration: 3.6,
      power: 6.4,
      uptime: '14h 10m',
    },
    alertsCount: 1,
  },
  {
    id: 'MM-ROB-003',
    name: 'Robotic Cell A',
    type: '6-DOF Articulated Cell',
    location: 'Bay 1 — Automated Assembly',
    health: 98,
    status: 'running',
    statusLabel: 'Operating Nominal',
    lastSync: '3m ago',
    calibrationInterval: '500 hrs',
    readings: {
      temperature: 46.5,
      vibration: 0.9,
      power: 2.2,
      uptime: '42h 15m',
    },
    alertsCount: 0,
  },
  {
    id: 'MM-HYD-004',
    name: 'Hydraulic Press 04',
    type: '200-Ton Stamping Unit',
    location: 'Bay 5 — Heavy Tooling',
    health: 79,
    status: 'warning',
    statusLabel: 'Spindle Warning',
    lastSync: '4m ago',
    calibrationInterval: '200 hrs',
    readings: {
      temperature: 64.0,
      vibration: 3.8,
      power: 11.2,
      uptime: '09h 30m',
    },
    alertsCount: 1,
  },
];

export default function FleetOverview({ onNavigate, onNavigateToMachine, onNavigateToCopilot }) {
  const [fleet, setFleet] = useState(INITIAL_FLEET);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'healthy' | 'warning'
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [runningDiagId, setRunningDiagId] = useState(null);

  // New Machine Form State
  const [newMachine, setNewMachine] = useState({
    name: '',
    id: '',
    type: '5-Axis Milling Unit',
    location: '',
    calibrationInterval: '300 hrs',
  });

  // Helper Toast Trigger
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const stats = useMemo(() => {
    const total = fleet.length;
    const running = fleet.filter((m) => m.status === 'running').length;
    const warnings = fleet.filter((m) => m.status === 'warning').length;
    const avgHealth = Math.round(
      fleet.reduce((acc, curr) => acc + curr.health, 0) / (total || 1)
    );
    const totalAlerts = fleet.reduce((acc, curr) => acc + curr.alertsCount, 0);

    return { total, running, warnings, avgHealth, totalAlerts };
  }, [fleet]);

  // Filtered Machines
  const filteredMachines = useMemo(() => {
    return fleet.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === 'healthy') return item.status === 'running' && item.health >= 85;
      if (statusFilter === 'warning') return item.status === 'warning' || item.health < 85;
      return true;
    });
  }, [fleet, searchQuery, statusFilter]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!newMachine.name.trim() || !newMachine.id.trim() || !newMachine.location.trim()) {
      return;
    }

    const created = {
      id: newMachine.id.trim().toUpperCase(),
      name: newMachine.name.trim(),
      type: newMachine.type,
      location: newMachine.location.trim(),
      health: 96,
      status: 'running',
      statusLabel: 'Operating Nominal',
      lastSync: 'Just now',
      calibrationInterval: newMachine.calibrationInterval,
      readings: {
        temperature: 52.4,
        vibration: 1.2,
        power: 3.5,
        uptime: '0h 05m',
      },
      alertsCount: 0,
    };

    setFleet((prev) => [created, ...prev]);
    setIsRegisterModalOpen(false);
    setNewMachine({
      name: '',
      id: '',
      type: '5-Axis Milling Unit',
      location: '',
      calibrationInterval: '300 hrs',
    });
    triggerToast(`Unit "${created.name}" registered to edge gateway bus.`);
  };

  const handleQuickDiagnostics = (id, name) => {
    setRunningDiagId(id);
    setTimeout(() => {
      setRunningDiagId(null);
      triggerToast(`Diagnostics complete for ${name}: all sensor nodes responding.`);
    }, 1200);
  };

  const handleSimulateAnomaly = (id) => {
    setFleet((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const isWarn = m.status === 'warning';
          return {
            ...m,
            status: isWarn ? 'running' : 'warning',
            statusLabel: isWarn ? 'Operating Nominal' : 'Thermal Spindle Warning',
            health: isWarn ? 93 : 71,
            alertsCount: isWarn ? 0 : 2,
            readings: {
              ...m.readings,
              temperature: isWarn ? 62.0 : 81.5,
              vibration: isWarn ? 2.0 : 4.1,
            },
          };
        }
        return m;
      })
    );
    triggerToast(`Simulation toggled for machine ID ${id}`);
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

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Top Header Breadcrumb & Status Strip */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200/80 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
              <span>MachineMitra Platform</span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Fleet Command</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Machine Fleet Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Live edge telemetry, vibration health thresholds, and autonomous predictive indicators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Gateway: Online (100 Hz Bus)</span>
            </span>

            {onNavigateToCopilot && (
              <button
                onClick={onNavigateToCopilot}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200/80 transition-colors shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Ask Copilot</span>
              </button>
            )}
          </div>
        </div>

        {/* 1. HEADER STATS BAR (3 Clean KPI Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mt-6">
          {/* Card 1: Fleet Health Index with SVG Ring */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Fleet Health Index
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                  <TrendingUp className="w-3 h-3 mr-0.5" /> +1.2%
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.avgHealth}%
              </div>
              <p className="text-xs text-slate-500">Normal operating tolerance &gt; 85%</p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-100"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${stats.avgHealth}, 100`}
                  strokeWidth="3.2"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <Activity className="w-5 h-5 text-emerald-600 absolute" />
            </div>
          </div>

          {/* Card 2: Active Machinery */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Machinery
                </span>
                <span className="inline-flex items-center text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                  Steady Uptime
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.running} <span className="text-base font-normal text-slate-400">/ {stats.total} units</span>
              </div>
              <p className="text-xs text-slate-500">
                {Math.round((stats.running / (stats.total || 1)) * 100)}% active tooling capacity
              </p>
            </div>

            <div className="w-13 h-13 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Cpu className="w-6 h-6" />
            </div>
          </div>

          {/* Card 3: Active Alerts */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex items-center justify-between hover:border-slate-300 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Active Alerts
                </span>
                <span
                  className={`inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                    stats.totalAlerts > 0
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}
                >
                  {stats.totalAlerts > 0 ? 'Requires Review' : 'Zero Flags'}
                </span>
              </div>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {stats.totalAlerts}
              </div>
              <p className="text-xs text-slate-500">
                {stats.warnings} unit(s) reporting thermal or oscillation delta
              </p>
            </div>

            <div className="w-13 h-13 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* 2. CONTROL & FILTER TOOLBAR */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-8 pb-4">
          {/* Segmented Filter Pills */}
          <div className="inline-flex p-1 bg-slate-100/90 border border-slate-200/70 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Machines ({fleet.length})
            </button>
            <button
              onClick={() => setStatusFilter('healthy')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'healthy'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Healthy ({fleet.filter((m) => m.health >= 85).length})
            </button>
            <button
              onClick={() => setStatusFilter('warning')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === 'warning'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Needs Attention ({fleet.filter((m) => m.health < 85).length})
            </button>
          </div>

          {/* Search Bar + Register Button */}
          <div className="flex items-center gap-2.5">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search machine, ID, or bay..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-1.5 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 text-slate-800 placeholder:text-slate-400 transition-all shadow-2xs"
              />
            </div>

            <button
              onClick={() => setIsRegisterModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-200 transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Register Machine</span>
            </button>
          </div>
        </div>

        {/* 3. EQUIPMENT FLEET CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-2">
          {filteredMachines.map((machine) => {
            const isWarning = machine.status === 'warning' || machine.health < 85;

            return (
              <div
                key={machine.id}
                className={`bg-white border rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isWarning ? 'border-amber-300/80 ring-1 ring-amber-100' : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-bold text-slate-900 tracking-tight">
                          {machine.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-600 border border-slate-200/70">
                          {machine.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {machine.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{machine.location}</span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          isWarning
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isWarning ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                        />
                        {machine.statusLabel}
                      </span>

                      {machine.alertsCount > 0 && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                          {machine.alertsCount} telemetry flag(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Health Progress Track */}
                  <div className="space-y-1.5 mb-5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium">Health Rating</span>
                      <span
                        className={`font-bold ${
                          isWarning ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        {machine.health}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isWarning
                            ? 'bg-gradient-to-r from-amber-400 to-amber-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        }`}
                        style={{ width: `${machine.health}%` }}
                      />
                    </div>
                  </div>

                  {/* Sensor Mini-Matrix */}
                  <div className="grid grid-cols-4 gap-2.5 py-3 px-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-left mb-4">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Thermometer className="w-3 h-3 text-slate-400" />
                        <span>Temp</span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-bold mt-0.5 ${
                          machine.readings.temperature > 75 ? 'text-amber-700' : 'text-slate-800'
                        }`}
                      >
                        {machine.readings.temperature}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">°C</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span>Vibration</span>
                      </div>
                      <div
                        className={`text-xs sm:text-sm font-bold mt-0.5 ${
                          machine.readings.vibration > 3.0 ? 'text-amber-700' : 'text-slate-800'
                        }`}
                      >
                        {machine.readings.vibration}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">mm/s</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Zap className="w-3 h-3 text-slate-400" />
                        <span>Power</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5">
                        {machine.readings.power}
                        <span className="text-[10px] font-normal text-slate-400 ml-0.5">kW</span>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>Uptime</span>
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 truncate">
                        {machine.readings.uptime}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300" />
                    <span>Sync: {machine.lastSync}</span>
                    <button
                      onClick={() => handleSimulateAnomaly(machine.id)}
                      className="text-[11px] text-slate-400 hover:text-slate-600 underline ml-1 cursor-pointer"
                      title="Toggle simulated thermal spike"
                    >
                      {isWarning ? 'Clear Anomaly' : 'Simulate Spike'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickDiagnostics(machine.id, machine.name)}
                      disabled={runningDiagId === machine.id}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-colors flex items-center gap-1"
                    >
                      {runningDiagId === machine.id ? (
                        <>
                          <RefreshCw className="w-3 h-3 animate-spin text-indigo-600" />
                          <span>Scanning...</span>
                        </>
                      ) : (
                        <span>Quick Test</span>
                      )}
                    </button>

                    <button
                      onClick={() => onNavigateToMachine && onNavigateToMachine(machine.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium flex items-center gap-1 transition-colors"
                    >
                      <span>View Details</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty Search State */}
        {filteredMachines.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-8 mt-4">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No machinery matched your filters</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search terms or clearing the status filter to see all connected equipment.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
              className="mt-4 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 4. INTERACTIVE REGISTER MACHINE MODAL */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Plus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Register New Equipment</h3>
                  <p className="text-xs text-slate-500">Add machine telemetry node to edge gateway</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Machine Display Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5-Axis Milling Unit 05"
                  value={newMachine.name}
                  onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Serial / Hardware ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MM-CNC-005"
                  value={newMachine.id}
                  onChange={(e) => setNewMachine({ ...newMachine, id: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50 font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Equipment Class
                  </label>
                  <select
                    value={newMachine.type}
                    onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50"
                  >
                    <option value="5-Axis Milling Unit">5-Axis Milling</option>
                    <option value="Heavy Duty Servo Lathe">Servo Lathe</option>
                    <option value="6-DOF Articulated Cell">Robotic Arm</option>
                    <option value="200-Ton Stamping Unit">Hydraulic Press</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calibration Cycle
                  </label>
                  <select
                    value={newMachine.calibrationInterval}
                    onChange={(e) =>
                      setNewMachine({ ...newMachine, calibrationInterval: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50"
                  >
                    <option value="200 hrs">Every 200 hrs</option>
                    <option value="300 hrs">Every 300 hrs</option>
                    <option value="500 hrs">Every 500 hrs</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Floor Location / Work Cell
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bay 3 — Machining Annex"
                  value={newMachine.location}
                  onChange={(e) => setNewMachine({ ...newMachine, location: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-50"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-semibold shadow-xs shadow-indigo-200 transition-colors"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}