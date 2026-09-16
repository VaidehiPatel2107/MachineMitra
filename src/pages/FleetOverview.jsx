import { useState } from "react";
import FactoryCopilot from "./FactoryCopilot";

function FleetOverview() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePage, setActivePage] = useState("dashboard");

  if (activePage === "copilot") {
    return <FactoryCopilot onNavigate={setActivePage} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
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

          <a className="nav-item" href="#">
            <span className="nav-icon">⚙</span>
            {sidebarOpen && <span>Machine</span>}
          </a>

          <a className="nav-item" href="#">
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
          <div>
            <h1>Machine Fleet Overview</h1>
            <p>
              Monitor your machines and their current health status.
            </p>
          </div>

          <div className="user-profile">
            <div className="profile-icon">A</div>

            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        {/* Statistics */}
        <section className="stats-grid">

          <div className="stat-card">
            <span className="stat-title">Overall Health</span>
            <strong className="stat-value">92%</strong>
            <span className="stat-status good">Healthy</span>
          </div>

          <div className="stat-card">
            <span className="stat-title">Running Machines</span>
            <strong className="stat-value">1</strong>
            <span className="stat-status good">Online</span>
          </div>

          <div className="stat-card">
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
                <h3>CNC Machine 01</h3>
                <span className="machine-id">
                  Machine ID: MM-CNC-001
                </span>
              </div>

              <span className="online-badge">
                ● Online
              </span>
            </div>

            {/* Health */}
            <div className="machine-health">

              <div>
                <span>Machine Health</span>
                <strong>92%</strong>
              </div>

              <div className="health-bar">
                <div className="health-progress"></div>
              </div>

            </div>

            {/* Readings */}
            <div className="machine-readings">

              <div className="reading">
                <span>Temperature</span>
                <strong>68°C</strong>
                <small>Normal</small>
              </div>

              <div className="reading">
                <span>Vibration</span>
                <strong>2.4 mm/s</strong>
                <small>Normal</small>
              </div>

              <div className="reading">
                <span>Power</span>
                <strong>4.8 kW</strong>
                <small>Normal</small>
              </div>

              <div className="reading">
                <span>Operating Status</span>
                <strong>Running</strong>
                <small>Since 08:30 AM</small>
              </div>

            </div>

            {/* Footer */}
            <div className="machine-footer">

              <span>
                Last updated: Just now
              </span>

              <button className="view-button">
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