import React, { useState, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  FileText,
  Gauge,
  MapPin,
  RefreshCw,
  Sliders,
  Sparkles,
  Thermometer,
  Wrench,
  X,
  Zap
} from 'lucide-react';

const DRILLER_DATA = {
  name: 'CNC Industrial Drilling Machine',
  id: 'MM-DRL-001',
  model: 'Automated Precision Drill Unit',
  location: 'Bay 3 — Precision Fabrication',
  status: 'running',
  statusLabel: 'Online & Drilling Active',
  health: 93,
  operatingHours: 1840,
  commissionDate: '10 Feb 2025',
  lastMaintenance: '15 Sep 2026',
  nextMaintenance: '2026-10-15',
  assignedTechnician: 'K. Sharma (Drilling & Tooling Lead)',
  subsystems: [
    { id: 'drillbit', name: 'Carbide Drill Bit & Chuck', health: 91, status: 'Optimal Sharpness', warning: false },
    { id: 'spindle', name: 'Spindle Drive Motor', health: 95, status: 'Balanced RPM', warning: false },
    { id: 'feed', name: 'Z-Axis Feed Servo Actuator', health: 88, status: 'Normal Backlash', warning: false },
    { id: 'coolant', name: 'Coolant & Lubrication Jet', health: 79, status: 'Check Pressure Filter', warning: true },
  ],
  readings: [
    { label: 'Drill Head Temp', value: 64.8, unit: '°C', max: 95, status: 'Optimal', warning: false, icon: Thermometer },
    { label: 'Vibration RMS', value: 1.8, unit: 'mm/s', max: 4.5, status: 'Normal', warning: false, icon: Activity },
    { label: 'Spindle Velocity', value: 2850, unit: 'RPM', max: 4000, status: 'Nominal', warning: false, icon: Gauge },
    { label: 'Drill Active Power', value: 5.2, unit: 'kW', max: 12.0, status: 'Optimal', warning: false, icon: Zap },
    { label: 'Feed Torque', value: 18.4, unit: 'Nm', max: 35.0, status: 'Balanced', warning: false, icon: Cpu },
    { label: 'Coolant Flow', value: 3.2, unit: 'L/min', max: 5.0, status: 'Flow Steady', warning: false, icon: Sliders },
  ],
};

export default function Machine({ onNavigateToFleet, onNavigateToCopilot, onNavigateToReadings }) {
  const [machine, setMachine] = useState(DRILLER_DATA);
  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [maintForm, setMaintForm] = useState({
    tasks: 'Drill chuck runout inspection and carbide bit replacement.',
    technician: 'K. Sharma',
    nextDate: '2026-11-15',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const daysUntilNextMaint = useMemo(() => {
    const target = new Date(machine.nextMaintenance);
    const simulatedToday = new Date('2026-09-29');
    const diffDays = Math.ceil((target - simulatedToday) / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [machine.nextMaintenance]);

  const handleRunDiagnostics = () => {
    setIsRunningDiag(true);
    setDiagResult(null);

    setTimeout(() => {
      setIsRunningDiag(false);
      setDiagResult({
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        title: `Self-Test Diagnostics Complete: ${machine.name}`,
        summary: `All optical spindle encoders, feed torque strain gauges, and fluid flow transducers validated for ${machine.id}.`,
        advisory: 'Advisory: Coolant filter pressure drop is at 1.4 bar. Clean or replace mesh before 50-hole boring batch.',
      });
      showToast('Drilling unit diagnostics complete: all channels validated.');
    }, 1100);
  };

  const handleLogMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!maintForm.tasks.trim() || !maintForm.nextDate) return;

    setMachine((prev) => ({
      ...prev,
      lastMaintenance: '29 Sep 2026',
      nextMaintenance: maintForm.nextDate,
      health: 98,
      subsystems: prev.subsystems.map((sub) =>
        sub.id === 'coolant' ? { ...sub, health: 95, status: 'Filter Flushed', warning: false } : sub
      ),
    }));

    setIsLogModalOpen(false);
    showToast(`Maintenance logged successfully for ${machine.id}.`);
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb Header Strip */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 font-medium">
            <button onClick={onNavigateToFleet} className="hover:text-slate-800 transition-colors cursor-pointer">
              Fleet Command
            </button>
            <span>/</span>
            <span className="text-slate-800 font-semibold">{machine.name}</span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {machine.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-md font-mono text-xs bg-slate-100 text-slate-700 font-bold border border-slate-200">
              {machine.id}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {machine.statusLabel}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-3 flex-wrap">
            <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {machine.location}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Runtime: <strong>{machine.operatingHours} hrs</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRunDiagnostics}
            disabled={isRunningDiag}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
          >
            {isRunningDiag ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Running Scan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Run Self-Test Diagnostics</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsLogModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Wrench className="w-4 h-4" />
            <span>+ Log Maintenance</span>
          </button>
        </div>
      </div>

      {diagResult && (
        <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
            <CheckCircle2 className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 text-xs sm:text-sm">
            <div className="flex items-center justify-between gap-2">
              <span className="font-bold text-slate-900">{diagResult.title}</span>
              <span className="text-[11px] text-slate-400 font-mono">{diagResult.timestamp}</span>
            </div>
            <p className="text-slate-600 mt-1">{diagResult.summary}</p>
            <div className="mt-2 p-2 rounded-lg bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{diagResult.advisory}</span>
            </div>
          </div>
          <button onClick={() => setDiagResult(null)} className="text-slate-400 hover:text-slate-600 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Health and Subsystems */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Health Rating</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Drilling Subsystem Degradation</h3>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-100">
                Operating Nominal &gt; 85%
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 py-6 border-b border-slate-100">
              <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-100"
                    strokeWidth="3.2"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-500"
                    strokeDasharray={`${machine.health}, 100`}
                    strokeWidth="3.2"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">{machine.health}%</span>
                  <span className="text-[10px] uppercase font-semibold text-slate-400">Score</span>
                </div>
              </div>

              <div className="space-y-1 text-center sm:text-left">
                <h4 className="text-sm font-bold text-slate-800">Carbide Drill Bit & Spindle Alignment</h4>
                <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                  Drill head radial runout is measured within 0.004 mm tolerance. Active vibration analysis indicates smooth penetration through composite and steel stock.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3.5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Critical Monitored Modules
                </span>
                <span className="text-[11px] text-slate-400">4 Active Nodes</span>
              </div>

              {machine.subsystems.map((sub) => (
                <div key={sub.id} className="p-3 rounded-xl bg-slate-50/80 border border-slate-100 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${sub.warning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                      <span className="font-semibold text-slate-800">{sub.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                        sub.warning ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                      }`}>
                        {sub.status}
                      </span>
                      <span className="font-bold text-slate-900">{sub.health}%</span>
                    </div>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${sub.warning ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${sub.health}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Protocol: <strong>Industrial JSON Stream / Modbus TCP</strong></span>
            {onNavigateToCopilot && (
              <button
                onClick={onNavigateToCopilot}
                className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>Ask Copilot about Drill Bit Longevity</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Asset Specifications */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Registry</span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">Asset Specifications</h3>
              </div>
              <button
                onClick={() => showToast('Specification manifest downloaded.')}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Specs PDF</span>
              </button>
            </div>

            <div className="my-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">
                  Next Maintenance Inspection
                </span>
                <div className="text-base font-bold text-slate-900 mt-0.5">{machine.nextMaintenance}</div>
                <span className="text-xs text-slate-500">Tool wear calibration cycle</span>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                Due in {daysUntilNextMaint} days
              </span>
            </div>

            <div className="divide-y divide-slate-100 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Asset Serial ID</span>
                <span className="font-mono font-semibold text-slate-800">{machine.id}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Model Classification</span>
                <span className="font-medium text-slate-800 text-right">{machine.model}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Plant Location</span>
                <span className="font-medium text-slate-800">{machine.location}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Commission Date</span>
                <span className="font-medium text-slate-800">{machine.commissionDate}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Last Overhaul</span>
                <span className="font-medium text-slate-800">{machine.lastMaintenance}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500">Lead Specialist</span>
                <span className="font-medium text-slate-800">{machine.assignedTechnician}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Warranty: <strong>Gold Precision Care</strong></span>
            </span>
            <span className="font-mono text-[11px] text-slate-400">Node v2.4-RT</span>
          </div>
        </div>
      </div>

      {/* Sensor Strip */}
      <div className="mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-2 gap-2">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Drilling Machine Sensor Telemetry
            </h3>
            <p className="text-xs text-slate-500">Live operational channels on {machine.id}</p>
          </div>

          {onNavigateToReadings && (
            <button
              onClick={onNavigateToReadings}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200 transition-colors cursor-pointer self-start sm:self-auto"
            >
              <span>View Historical Telemetry Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          {machine.readings.map((r) => {
            const IconComp = r.icon;
            const pct = Math.min(100, (r.value / r.max) * 100);
            return (
              <div
                key={r.label}
                className={`bg-white border rounded-xl p-3.5 shadow-2xs flex flex-col justify-between ${
                  r.warning ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-[11px] font-medium truncate max-w-[90px]">{r.label}</span>
                    <IconComp className={`w-3.5 h-3.5 ${r.warning ? 'text-amber-500' : 'text-slate-400'}`} />
                  </div>
                  <div className="text-base sm:text-lg font-bold text-slate-900">
                    {r.value} <span className="text-[11px] font-normal text-slate-400">{r.unit}</span>
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${r.warning ? 'bg-amber-500' : 'bg-indigo-600'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">Max: {r.max}</span>
                  <span className={`font-semibold ${r.warning ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {r.warning ? 'Warning' : 'Normal'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Maintenance Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Drilling Unit Maintenance</h3>
              <button onClick={() => setIsLogModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogMaintenanceSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Asset</label>
                <input
                  type="text"
                  disabled
                  value={`${machine.name} (${machine.id})`}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Maintenance Overhaul Notes</label>
                <textarea
                  required
                  rows={3}
                  value={maintForm.tasks}
                  onChange={(e) => setMaintForm({ ...maintForm, tasks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Technician</label>
                  <input
                    type="text"
                    required
                    value={maintForm.technician}
                    onChange={(e) => setMaintForm({ ...maintForm, technician: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Inspection</label>
                  <input
                    type="date"
                    required
                    value={maintForm.nextDate}
                    onChange={(e) => setMaintForm({ ...maintForm, nextDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsLogModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Confirm & Update Health
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}