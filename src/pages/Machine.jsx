import { useState } from "react";
import "../App.css";

// ─── Static machine data ──────────────────────────────────────────────────────
// Replace these values with API data when the backend is ready.

const MACHINE = {
  name: "CNC Machine 01",
  id: "CNC-001",
  type: "CNC Machine",
  location: "Production Floor",
  status: "Running",
  installDate: "15 Jan 2024",
  lastMaintenance: "02 Sep 2026",
  nextMaintenance: "02 Oct 2026",
  health: 92,
};

const READINGS = [
  { label: "Temperature", value: "68",   unit: "°C",    status: "Normal",  statusClass: "status-good" },
  { label: "Vibration",   value: "2.4",  unit: "mm/s",  status: "Normal",  statusClass: "status-good" },
  { label: "Power",       value: "4.8",  unit: "kW",    status: "Normal",  statusClass: "status-good" },
  { label: "RPM",         value: "1450", unit: "rpm",   status: "Normal",  statusClass: "status-good" },
  { label: "Current",     value: "8.2",  unit: "A",     status: "Normal",  statusClass: "status-good" },
];

const INFO_ROWS = [
  { label: "Machine ID",        value: MACHINE.id },
  { label: "Machine Type",      value: MACHINE.type },
  { label: "Location",          value: MACHINE.location },
  { label: "Operating Status",  value: MACHINE.status },
  { label: "Installation Date", value: MACHINE.installDate },
  { label: "Last Maintenance",  value: MACHINE.lastMaintenance },
  { label: "Next Maintenance",  value: MACHINE.nextMaintenance },
];
// ─────────────────────────────────────────────────────────────────────────────

function Machine({ onNavigate, sidebarOpen, setSidebarOpen }) {
  return (
    <div className={`dashboard ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* Sidebar */}
      <aside className="sidebar">

        <div className="sidebar-top">
          <button
            className="menu-button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>

          {sidebarOpen && (
            <div className="sidebar-brand">
              <h2>MachineMitra</h2>
              <span>AI Predictive Maintenance</span>
            </div>
          )}
        </div>

        <nav>
          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); onNavigate("dashboard"); }}>
            <span className="nav-icon">⌂</span>
            {sidebarOpen && <span>Dashboard</span>}
          </a>

          <a className="nav-item active" href="#">
            <span className="nav-icon">⚙</span>
            {sidebarOpen && <span>Machine</span>}
          </a>

          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); onNavigate("readings"); }}>
            <span className="nav-icon">▥</span>
            {sidebarOpen && <span>Readings</span>}
          </a>

          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); onNavigate("copilot"); }}>
            <span className="nav-icon">✦</span>
            {sidebarOpen && <span>Factory Copilot</span>}
          </a>
        </nav>

      </aside>

      {/* Main Content */}
      <main className="main-content">

        {/* Top Bar */}
        <header className="topbar">
          <div className="mp-topbar-title">
            <h1>{MACHINE.name}</h1>
            <p>Detailed machine information and health status</p>
          </div>

          <div className="mp-topbar-right">
            <span className="online-badge">
              <span className="pulse-dot"></span> Online
            </span>
            <div className="user-profile">
              <div className="profile-icon">A</div>
              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Health */}
        <section className="mp-section">
          <h2 className="mp-section-title">Machine Health</h2>
          <div className="machine-card">
            <div className="mp-health-row">
              <div className="mp-health-labels">
                <span className="mp-health-pct">{MACHINE.health}%</span>
                <span className="status-good mp-health-status">Healthy</span>
              </div>
              <div className="health-bar mp-health-bar">
                <div className="health-progress" style={{ width: `${MACHINE.health}%` }}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Machine Information */}
        <section className="mp-section">
          <h2 className="mp-section-title">Machine Information</h2>
          <div className="machine-card mp-info-grid">
            {INFO_ROWS.map((row) => (
              <div key={row.label} className="mp-info-row">
                <span className="mp-info-label">{row.label}</span>
                <span className="mp-info-value">{row.value}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Current Readings */}
        <section className="mp-section">
          <h2 className="mp-section-title">Current Readings</h2>
          <div className="mp-readings-grid">
            {READINGS.map((r) => (
              <div key={r.label} className="reading">
                <span>{r.label}</span>
                <strong>{r.value} <small className="mp-unit">{r.unit}</small></strong>
                <small className={r.statusClass}>{r.status}</small>
              </div>
            ))}
          </div>
        </section>

        {/* Alerts */}
        <section className="mp-section">
          <h2 className="mp-section-title">Alerts</h2>
          <div className="machine-card mp-no-alerts">
            <span className="mp-no-alerts-dot">✓</span>
            <div>
              <strong>No active critical alerts</strong>
              <p>All systems are operating within normal parameters.</p>
            </div>
          </div>
        </section>

        {/* Maintenance */}
        <section className="mp-section">
          <h2 className="mp-section-title">Maintenance</h2>
          <div className="machine-card mp-maintenance">
            <div className="mp-maint-info">
              <div className="mp-maint-item">
                <span className="mp-info-label">Last Maintenance</span>
                <span className="mp-info-value">{MACHINE.lastMaintenance}</span>
              </div>
              <div className="mp-maint-item">
                <span className="mp-info-label">Next Scheduled</span>
                <span className="mp-info-value mp-next-date">{MACHINE.nextMaintenance}</span>
              </div>
            </div>
            <button className="view-button mp-maint-btn">Maintenance History →</button>
          </div>
        </section>

        {/* Navigation action */}
        <div className="mp-actions">
          <button
            className="add-machine"
            onClick={() => onNavigate("readings")}
          >
            View Real-Time Readings →
          </button>
        </div>

      </main>

    </div>
  );
}

// Machine page owns no sidebar state — caller (FleetOverview) passes it down.
// This keeps the collapse state continuous across page switches.
function MachineWithState({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return <Machine onNavigate={onNavigate} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
}

export default MachineWithState;
