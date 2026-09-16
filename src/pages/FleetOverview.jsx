import { useState } from "react";
import FactoryCopilot from "./FactoryCopilot";
import Machine from "./Machine";
import Readings from "./Readings";

// ─── Static fleet data ────────────────────────────────────────────────────────
const FLEET_MACHINE = {
  name: "CNC Machine 01",
  id: "MM-CNC-001",
  health: 92,
  lastUpdated: "Just now",
};

const FLEET_READINGS = [
  { label: "Temperature", value: "68",   unit: "°C",   statusClass: "status-good",    status: "Normal" },
  { label: "Vibration",   value: "2.4",  unit: "mm/s", statusClass: "status-good",    status: "Normal" },
  { label: "Power",       value: "4.8",  unit: "kW",   statusClass: "status-good",    status: "Normal" },
  { label: "Operating Status", value: "Running", unit: "", statusClass: "status-neutral", status: "Since 08:30 AM" },
];
// ─────────────────────────────────────────────────────────────────────────────

function FleetOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  if (activePage === "copilot") {
    return <FactoryCopilot onNavigate={setActivePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  if (activePage === "machine") {
    return <Machine onNavigate={setActivePage} />;
  }

  if (activePage === "readings") {
    return <Readings onNavigate={setActivePage} />;
  }

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
          <a className="nav-item active" href="#">
            <span className="nav-icon">⌂</span>
            {sidebarOpen && <span>Dashboard</span>}
          </a>

          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); setActivePage("machine"); }}>
            <span className="nav-icon">⚙</span>
            {sidebarOpen && <span>Machine</span>}
          </a>

          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); setActivePage("readings"); }}>
            <span className="nav-icon">▥</span>
            {sidebarOpen && <span>Readings</span>}
          </a>

          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); setActivePage("copilot"); }}>
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
            <h1>Machine Fleet Overview</h1>
            <p>Monitor your machines and their current health status.</p>
          </div>

          <div className="mp-topbar-right">
            <div className="user-profile">
              <div className="profile-icon">A</div>
              <div>
                <strong>Admin</strong>
                <span>Administrator</span>
              </div>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card stat-card--blue">
            <span className="stat-title">Overall Health</span>
            <strong className="stat-value">92%</strong>
            <span className="stat-status good">Healthy</span>
          </div>

          <div className="stat-card stat-card--green">
            <span className="stat-title">Running Machines</span>
            <strong className="stat-value">1</strong>
            <span className="stat-status good">Online</span>
          </div>

          <div className="stat-card stat-card--orange">
            <span className="stat-title">Active Alerts</span>
            <strong className="stat-value">2</strong>
            <span className="stat-status warning">Needs Attention</span>
          </div>

        </section>

        {/* Machine Section */}
        <section className="machine-section">

          <div className="section-header">
            <div>
              <h2>Your Machines</h2>
              <p>Current machine performance</p>
            </div>

            <button className="add-machine">
              + Add Machine
            </button>
          </div>

          {/* Machine Card */}
          <div className="machine-card">

            <div className="machine-header">
              <div>
                <h3>{FLEET_MACHINE.name}</h3>
                <span className="machine-id">Machine ID: {FLEET_MACHINE.id}</span>
              </div>

              <span className="online-badge">
                <span className="pulse-dot"></span> Online
              </span>
            </div>

            {/* Health */}
            <div className="machine-health">

              <div>
                <span>Machine Health</span>
                <strong>{FLEET_MACHINE.health}%</strong>
              </div>

              <div className="health-bar">
                <div className="health-progress" style={{ width: `${FLEET_MACHINE.health}%` }}></div>
              </div>

            </div>

            {/* Readings */}
            <div className="machine-readings">
              {FLEET_READINGS.map((r) => (
                <div key={r.label} className="reading">
                  <span>{r.label}</span>
                  <strong>
                    {r.value}{r.unit && <small className="mp-unit"> {r.unit}</small>}
                  </strong>
                  <small className={r.statusClass}>{r.status}</small>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="machine-footer">
              <span>Last updated: {FLEET_MACHINE.lastUpdated}</span>
              <button className="view-button" onClick={() => setActivePage("machine")}>
                View Details →
              </button>
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default FleetOverview;