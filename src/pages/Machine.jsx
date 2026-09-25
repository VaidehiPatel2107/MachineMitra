import React, { useState, useMemo, useEffect } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Download,
  FileText,
  Gauge,
  Layers,
  MapPin,
  RefreshCw,
  Sliders,
  Sparkles,
  Thermometer,
  User,
  Wrench,
  X,
  Zap
} from 'lucide-react';

const FLEET_DATABASE = {
  'MM-CNC-001': {
    name: 'CNC Machine 01',
    id: 'MM-CNC-001',
    model: '5-Axis Precision CNC Machining Center',
    location: 'Bay 4 — Production Floor',
    status: 'running',
    statusLabel: 'Operating Nominal',
    health: 94,
    operatingHours: 3420,
    commissionDate: '15 Jan 2024',
    lastMaintenance: '02 Sep 2026',
    nextMaintenance: '2026-10-02',
    assignedTechnician: 'K. Sharma (Lead Machining Spec)',
    subsystems: [
      { id: 'spindle', name: 'Spindle Drive Unit', health: 94, status: 'Optimal', warning: false },
      { id: 'ballscrew', name: 'X/Y/Z Axis Ball Screws', health: 88, status: 'Normal Wear', warning: false },
      { id: 'coolant', name: 'Coolant & Lubrication Loop', health: 76, status: 'Filter Attention Required', warning: true },
      { id: 'servos', name: 'Servo Motor Drives', health: 98, status: 'Optimal', warning: false },
    ],
    readings: [
      { label: 'Spindle Temp', value: 68.2, unit: '°C', max: 100, status: 'Optimal', warning: false, icon: Thermometer },
      { label: 'Vibration Velocity', value: 2.1, unit: 'mm/s', max: 5.0, status: 'Normal', warning: false, icon: Activity },
      { label: 'Active Load Power', value: 4.8, unit: 'kW', max: 10.0, status: 'Optimal', warning: false, icon: Zap },
      { label: 'Spindle Velocity', value: 1450, unit: 'RPM', max: 2500, status: 'Nominal', warning: false, icon: Gauge },
      { label: 'Phase Current', value: 8.2, unit: 'A', max: 15.0, status: 'Balanced', warning: false, icon: Cpu },
      { label: 'Coolant Reservoir', value: 2.8, unit: 'L', max: 5.0, status: 'Low Level (Min 3.0 L)', warning: true, icon: Sliders },
    ],
  },

  'MM-LTH-002': {
    name: 'Precision Lathe 02',
    id: 'MM-LTH-002',
    model: 'Heavy Duty Servo Lathe',
    location: 'Bay 2 — Precision Machining',
    status: 'warning',
    statusLabel: 'Thermal Advisory Flagged',
    health: 76,
    operatingHours: 4180,
    commissionDate: '10 Mar 2023',
    lastMaintenance: '18 Aug 2026',
    nextMaintenance: '2026-09-29',
    assignedTechnician: 'R. Verma (Rotor Dynamics)',
    subsystems: [
      { id: 'spindle', name: 'Spindle Drive Unit', health: 68, status: 'Thermal Spike Detected', warning: true },
      { id: 'ballscrew', name: 'Z-Axis Carriage Drive', health: 82, status: 'Moderate Friction', warning: false },
      { id: 'coolant', name: 'Cutting Fluid Recirculator', health: 89, status: 'Optimal Flow', warning: false },
      { id: 'servos', name: 'Main Chuck Inverter', health: 74, status: 'Phase Oscillation', warning: true },
    ],
    readings: [
      { label: 'Spindle Temp', value: 78.4, unit: '°C', max: 100, status: 'High Advisory', warning: true, icon: Thermometer },
      { label: 'Vibration Velocity', value: 3.6, unit: 'mm/s', max: 5.0, status: 'Elevated', warning: true, icon: Activity },
      { label: 'Active Load Power', value: 6.4, unit: 'kW', max: 10.0, status: 'High Load', warning: false, icon: Zap },
      { label: 'Spindle Velocity', value: 1820, unit: 'RPM', max: 2500, status: 'Nominal', warning: false, icon: Gauge },
      { label: 'Phase Current', value: 12.1, unit: 'A', max: 15.0, status: 'Ripple Warning', warning: true, icon: Cpu },
      { label: 'Coolant Reservoir', value: 4.1, unit: 'L', max: 5.0, status: 'Adequate', warning: false, icon: Sliders },
    ],
  },

  'MM-ROB-003': {
    name: 'Robotic Cell A',
    id: 'MM-ROB-003',
    model: '6-Axis Articulated Assembly Arm',
    location: 'Bay 1 — Automation Cell',
    status: 'running',
    statusLabel: 'Operating Nominal',
    health: 98,
    operatingHours: 1940,
    commissionDate: '04 Nov 2024',
    lastMaintenance: '12 Sep 2026',
    nextMaintenance: '2026-11-15',
    assignedTechnician: 'P. Nair (Robotics & Drives)',
    subsystems: [
      { id: 'joint1', name: 'Base Rotational Servo (J1-J3)', health: 97, status: 'Optimal Backlash', warning: false },
      { id: 'wrist', name: 'Harmonic Wrist Actuator (J4-J6)', health: 99, status: 'Precise Kinematics', warning: false },
      { id: 'gripper', name: 'Pneumatic End-Effector Loop', health: 95, status: 'Nominal Pressure', warning: false },
      { id: 'bus', name: 'EtherCAT Communication Bus', health: 100, status: 'Zero Packet Drops', warning: false },
    ],
    readings: [
      { label: 'Joint 3 Temp', value: 42.1, unit: '°C', max: 80, status: 'Optimal', warning: false, icon: Thermometer },
      { label: 'Harmonic Oscillation', value: 0.8, unit: 'mm/s', max: 3.5, status: 'Normal', warning: false, icon: Activity },
      { label: 'Total Servo Power', value: 2.3, unit: 'kW', max: 6.0, status: 'Optimal', warning: false, icon: Zap },
      { label: 'Cycle Speed', value: 120, unit: 'deg/s', max: 250, status: 'Nominal', warning: false, icon: Gauge },
      { label: 'Bus Latency', value: 1.2, unit: 'ms', max: 10.0, status: 'Ultra-low', warning: false, icon: Cpu },
      { label: 'Line Pressure', value: 6.2, unit: 'bar', max: 8.0, status: 'Nominal', warning: false, icon: Sliders },
    ],
  },

  'MM-HYD-004': {
    name: 'Hydraulic Press 04',
    id: 'MM-HYD-004',
    model: '150-Ton Precision Stamping Press',
    location: 'Bay 5 — Heavy Forming',
    status: 'warning',
    statusLabel: 'Hydraulic Pressure Delta',
    health: 71,
    operatingHours: 5820,
    commissionDate: '20 Aug 2022',
    lastMaintenance: '05 Aug 2026',
    nextMaintenance: '2026-09-30',
    assignedTechnician: 'A. Joshi (Hydraulics & Fluid Power)',
    subsystems: [
      { id: 'ram', name: 'Main Stamping Ram Piston', health: 74, status: 'Seal Wear Advisory', warning: true },
      { id: 'pump', name: 'Axial Piston Hydraulic Pump', health: 65, status: 'Pressure Ripple High', warning: true },
      { id: 'manifold', name: 'Proportional Control Valve Block', health: 81, status: 'Response Delayed', warning: false },
      { id: 'cooler', name: 'Fluid Heat Exchanger', health: 68, status: 'Thermal Buildup', warning: true },
    ],
    readings: [
      { label: 'Fluid Temp', value: 74.0, unit: '°C', max: 85, status: 'High Advisory', warning: true, icon: Thermometer },
      { label: 'Pump Vibration', value: 3.8, unit: 'mm/s', max: 5.0, status: 'Warning Band', warning: true, icon: Activity },
      { label: 'Draw Power', value: 11.2, unit: 'kW', max: 18.0, status: 'High Current', warning: false, icon: Zap },
      { label: 'Stroke Rate', value: 24, unit: 'SPM', max: 40, status: 'Nominal', warning: false, icon: Gauge },
      { label: 'Line Pressure', value: 198, unit: 'bar', max: 250, status: 'Pressure Delta', warning: true, icon: Cpu },
      { label: 'Oil Reservoir', value: 18.5, unit: 'L', max: 25.0, status: 'Adequate', warning: false, icon: Sliders },
    ],
  },
};
export default function Machine({ 
  machineId = 'MM-CNC-001', 
  onNavigateToFleet, 
  onNavigateToCopilot, 
  onNavigateToReadings 
}) {
  // Select data based on the machineId clicked from Fleet Overview
  const currentMachineData = FLEET_DATABASE[machineId] || FLEET_DATABASE['MM-CNC-001'];
  const [machine, setMachine] = useState(currentMachineData);

  // Sync state whenever a different machine is clicked
  useEffect(() => {
    setMachine(FLEET_DATABASE[machineId] || FLEET_DATABASE['MM-CNC-001']);
  }, [machineId]);

  const [isRunningDiag, setIsRunningDiag] = useState(false);
  const [diagResult, setDiagResult] = useState(null);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const [maintForm, setMaintForm] = useState({
    tasks: 'Spindle bearing ultrasonic scan and coolant replenishment.',
    technician: 'K. Sharma',
    nextDate: '2026-11-02',
  });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const daysUntilNextMaint = useMemo(() => {
    const target = new Date(machine.nextMaintenance);
    const simulatedToday = new Date('2026-09-25');
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
        title: `Self-Test Completed: ${machine.name}`,
        summary: `Telemetry bus validated for ${machine.id}. Edge node latency: 12ms.`,
        advisory: machine.health < 80 
          ? 'Thermal limit advisory active. Recommend lubricating spindle before next cycle.' 
          : 'All core actuators operating within safety tolerances.',
      });
      showToast(`Diagnostics completed for ${machine.name}`);
    }, 1200);
  };

  const handleLogMaintenanceSubmit = (e) => {
    e.preventDefault();
    if (!maintForm.tasks.trim() || !maintForm.nextDate) return;

    setMachine((prev) => ({
      ...prev,
      lastMaintenance: '25 Sep 2026',
      nextMaintenance: maintForm.nextDate,
      health: 96,
      subsystems: prev.subsystems.map((sub) => ({ ...sub, warning: false, status: 'Serviced' })),
      readings: prev.readings.map((r) => ({ ...r, warning: false, status: 'Optimal' })),
    }));

    setIsLogModalOpen(false);
    showToast(`Maintenance logged for ${machine.id}. Next check: ${maintForm.nextDate}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2.5 text-xs sm:text-sm border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
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
              <span className="text-slate-800 font-semibold">{machine.name}</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {machine.name}
              </h1>
              <span className="px-2 py-0.5 rounded-md font-mono text-xs bg-slate-100 text-slate-600 border border-slate-200">
                {machine.id}
              </span>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                machine.health < 80 
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${machine.health < 80 ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`} />
                {machine.statusLabel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {machine.location}</span>
              <span>•</span>
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> Runtime: <strong>{machine.operatingHours} hrs</strong></span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleRunDiagnostics}
              disabled={isRunningDiag}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-colors cursor-pointer disabled:opacity-60"
            >
              {isRunningDiag ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Scanning...</span>
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
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Wrench className="w-4 h-4" />
              <span>+ Log Maintenance</span>
            </button>
          </div>
        </div>

        {diagResult && (
          <div className="mt-6 p-4 rounded-2xl bg-white border border-indigo-100 shadow-xs flex items-start gap-3.5">
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

        {/* Diagnostic & Specifications Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Health Index</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">System Health Gauge</h3>
                </div>
                <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                  Target &gt; 85%
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
                      className={machine.health < 80 ? "text-amber-500" : "text-emerald-500"}
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
                    <span className="text-[10px] uppercase font-semibold text-slate-400">Rating</span>
                  </div>
                </div>

                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-slate-800">{machine.model}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed max-w-md">
                    Operating in {machine.location}. Telemetry feed sync frequency: 100 Hz.
                  </p>
                </div>
              </div>

              {/* Subsystems */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Critical Subsystems</span>
                  <span className="text-[11px] text-slate-400">{machine.subsystems.length} Monitored Nodes</span>
                </div>

                <div className="space-y-3.5">
                  {machine.subsystems.map((sub) => (
                    <div key={sub.id} className="p-3 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${sub.warning ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                          <span className="font-semibold text-slate-800">{sub.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded border ${
                            sub.warning
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {sub.status}
                          </span>
                          <span className="font-bold text-slate-900 w-8 text-right">{sub.health}%</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-200/70 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            sub.warning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${sub.health}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Telemetry: <strong>CANopen / 100 Hz Bus</strong></span>
              {onNavigateToCopilot && (
                <button
                  onClick={onNavigateToCopilot}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <span>Ask Copilot about {machine.name}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Specifications */}
          <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Asset Record</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">Machine Specifications</h3>
                </div>
              </div>

              <div className="my-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700">Next Service</span>
                  <div className="text-base font-bold text-slate-900 mt-0.5">{machine.nextMaintenance}</div>
                  <span className="text-xs text-slate-500">Preventive cycle</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-600 text-white">
                  Due in {daysUntilNextMaint} days
                </span>
              </div>

              <div className="divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Asset Serial ID</span>
                  <span className="font-mono font-semibold text-slate-800">{machine.id}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Classification</span>
                  <span className="font-medium text-slate-800 text-right">{machine.model}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Location</span>
                  <span className="font-medium text-slate-800">{machine.location}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Commission Date</span>
                  <span className="font-medium text-slate-800">{machine.commissionDate}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Last Serviced</span>
                  <span className="font-medium text-slate-800">{machine.lastMaintenance}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-slate-500">Technician</span>
                  <span className="font-medium text-slate-800">{machine.assignedTechnician}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
              <span>Gold Care Active</span>
              <span className="font-mono text-[11px] text-slate-400">Node v2.4-RT</span>
            </div>
          </div>
        </div>

        {/* Live Sensor Telemetry Strip */}
        <div className="mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 mb-2 gap-2">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Live Sensor Matrix</h3>
              <p className="text-xs text-slate-500">Real-time parameters for {machine.name}</p>
            </div>

            {onNavigateToReadings && (
              <button
                onClick={onNavigateToReadings}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl border border-indigo-200/70"
              >
                <span>View Waveform Stream</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            {machine.readings.map((reading) => {
              const IconComp = reading.icon;
              const pct = Math.min(100, (reading.value / reading.max) * 100);

              return (
                <div
                  key={reading.label}
                  className={`bg-white border rounded-xl p-3.5 shadow-2xs flex flex-col justify-between ${
                    reading.warning ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[11px] font-medium truncate max-w-[85px]">{reading.label}</span>
                      <IconComp className={`w-3.5 h-3.5 ${reading.warning ? 'text-amber-500' : 'text-slate-400'}`} />
                    </div>

                    <div className="text-base sm:text-lg font-bold text-slate-900">
                      {typeof reading.value === 'number' ? reading.value.toLocaleString() : reading.value}
                      <span className="text-[11px] font-normal text-slate-400 ml-1">{reading.unit}</span>
                    </div>

                    <div className="mt-2 w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          reading.warning ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400">Limit: &lt; {reading.max}</span>
                    <span className={`font-semibold ${reading.warning ? 'text-amber-700' : 'text-emerald-700'}`}>
                      {reading.warning ? 'Attention' : 'Normal'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Log Maintenance Modal */}
      {isLogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Log Maintenance Work</h3>
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Completed Notes</label>
                <textarea
                  required
                  rows={3}
                  value={maintForm.tasks}
                  onChange={(e) => setMaintForm({ ...maintForm, tasks: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Specialist</label>
                  <input
                    type="text"
                    required
                    value={maintForm.technician}
                    onChange={(e) => setMaintForm({ ...maintForm, technician: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Next Date</label>
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
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Save & Update Health
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}