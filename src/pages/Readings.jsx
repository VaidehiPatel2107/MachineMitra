import { useState } from "react";
import "../App.css";

// ─── Static / dummy data ──────────────────────────────────────────────────────
// Replace with API data when the backend is ready.
// Each history array has 6 points corresponding to TIME_LABELS.

const TIME_LABELS = ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50"];

const MACHINE_STATUS = {
  name: "CNC Machine 01",
  operatingStatus: "Running",
  health: 92,
  lastUpdated: "Just now",
};

const SENSOR_CARDS = [
  { label: "Temperature", value: "68",   unit: "°C",   status: "Normal", statusClass: "status-good" },
  { label: "Vibration",   value: "2.4",  unit: "mm/s", status: "Normal", statusClass: "status-good" },
  { label: "Power",       value: "4.8",  unit: "kW",   status: "Normal", statusClass: "status-good" },
  { label: "RPM",         value: "1450", unit: "rpm",  status: "Normal", statusClass: "status-good" },
  { label: "Current",     value: "8.2",  unit: "A",    status: "Normal", statusClass: "status-good" },
];

const SENSOR_HEALTH = [
  { label: "Temperature", status: "Normal", statusClass: "status-good" },
  { label: "Vibration",   status: "Normal", statusClass: "status-good" },
  { label: "Power",       status: "Normal", statusClass: "status-good" },
  { label: "RPM",         status: "Normal", statusClass: "status-good" },
  { label: "Current",     status: "Normal", statusClass: "status-good" },
];

// Trend data — raw y-values; min/max are used to auto-scale the SVG viewport.
const TRENDS = [
  {
    label: "Temperature Trend",
    unit: "°C",
    color: "#d9822b",
    fill: "rgba(217,130,43,0.08)",
    points: [64, 66, 65, 68, 70, 68],
    min: 58,
    max: 76,
  },
  {
    label: "Vibration Trend",
    unit: "mm/s",
    color: "#2678d9",
    fill: "rgba(38,120,217,0.08)",
    points: [2.0, 2.2, 2.1, 2.4, 2.3, 2.4],
    min: 1.5,
    max: 3.0,
  },
  {
    label: "Power Trend",
    unit: "kW",
    color: "#198754",
    fill: "rgba(25,135,84,0.08)",
    points: [4.2, 4.5, 4.6, 4.8, 4.7, 4.8],
    min: 3.5,
    max: 5.5,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

// Converts raw data points into SVG polyline coordinate string.
// viewBox width = 300, height = 80; 8px vertical padding.
const SVG_W = 300;
const SVG_H = 80;
const SVG_PAD = 10;

function buildPolyline(points, min, max) {
  const range = max - min || 1;
  return points
    .map((v, i) => {
      const x = (i / (points.length - 1)) * SVG_W;
      const y = SVG_H - SVG_PAD - ((v - min) / range) * (SVG_H - SVG_PAD * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

function buildFillPath(points, min, max) {
  const range = max - min || 1;
  const coords = points.map((v, i) => {
    const x = (i / (points.length - 1)) * SVG_W;
    const y = SVG_H - SVG_PAD - ((v - min) / range) * (SVG_H - SVG_PAD * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const first = coords[0].split(",");
  const last = coords[coords.length - 1].split(",");
  return `M ${first[0]},${SVG_H} L ${coords.join(" L ")} L ${last[0]},${SVG_H} Z`;
}

function Sparkline({ trend }) {
  const line = buildPolyline(trend.points, trend.min, trend.max);
  const fill = buildFillPath(trend.points, trend.min, trend.max);
  const last = trend.points[trend.points.length - 1];

  return (
    <div className="readings-chart-card machine-card">
      <div className="readings-chart-header">
        <span className="readings-chart-title">{trend.label}</span>
        <span className="readings-chart-current" style={{ color: trend.color }}>
          {last} {trend.unit}
        </span>
      </div>

      {/* SVG sparkline */}
      <svg
        className="readings-sparkline"
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d={fill} fill={trend.fill} />
        <polyline
          points={line}
          fill="none"
          stroke={trend.color}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* current value dot */}
        {(() => {
          const coords = line.split(" ");
          const last_coord = coords[coords.length - 1].split(",");
          return (
            <circle
              cx={last_coord[0]}
              cy={last_coord[1]}
              r="4"
              fill={trend.color}
            />
          );
        })()}
      </svg>

      {/* Time axis */}
      <div className="readings-time-axis">
        {TIME_LABELS.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

function Readings({ onNavigate, sidebarOpen, setSidebarOpen }) {
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

          <a className="nav-item" href="#" onClick={(e) => { e.preventDefault(); onNavigate("machine"); }}>
            <span className="nav-icon">⚙</span>
            {sidebarOpen && <span>Machine</span>}
          </a>

          <a className="nav-item active" href="#">
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
            <h1>Real-Time Readings</h1>
            <p>Live sensor data from CNC Machine 01</p>
          </div>

          <div className="mp-topbar-right">
            <span className="online-badge readings-live-badge">
              <span className="pulse-dot"></span> Live
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

        {/* Machine Status */}
        <section className="mp-section">
          <h2 className="mp-section-title">Machine Status</h2>
          <div className="machine-card readings-status-bar">
            <div className="readings-status-item">
              <span className="mp-info-label">Machine</span>
              <span className="mp-info-value">{MACHINE_STATUS.name}</span>
            </div>
            <div className="readings-status-divider" />
            <div className="readings-status-item">
              <span className="mp-info-label">Operating Status</span>
              <span className="mp-info-value status-good">{MACHINE_STATUS.operatingStatus}</span>
            </div>
            <div className="readings-status-divider" />
            <div className="readings-status-item">
              <span className="mp-info-label">Overall Health</span>
              <span className="mp-info-value status-good">{MACHINE_STATUS.health}%</span>
            </div>
            <div className="readings-status-divider" />
            <div className="readings-status-item">
              <span className="mp-info-label">Last Updated</span>
              <span className="mp-info-value">{MACHINE_STATUS.lastUpdated}</span>
            </div>
          </div>
        </section>

        {/* Current Sensor Readings */}
        <section className="mp-section">
          <h2 className="mp-section-title">Current Sensor Readings</h2>
          <div className="readings-sensor-grid">
            {SENSOR_CARDS.map((s) => (
              <div key={s.label} className="machine-card readings-sensor-card">
                <span className="readings-sensor-label">{s.label}</span>
                <div className="readings-sensor-value">
                  {s.value}
                  <span className="readings-sensor-unit">{s.unit}</span>
                </div>
                <span className={`readings-sensor-status ${s.statusClass}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trend Charts */}
        <section className="mp-section">
          <h2 className="mp-section-title">Trends (Last 50 min)</h2>
          <div className="readings-charts-grid">
            {TRENDS.map((t) => (
              <Sparkline key={t.label} trend={t} />
            ))}
          </div>
        </section>

        {/* Sensor Health */}
        <section className="mp-section">
          <h2 className="mp-section-title">Sensor Health</h2>
          <div className="machine-card readings-health-table">
            {SENSOR_HEALTH.map((s, i) => (
              <div key={s.label} className={`readings-health-row${i === SENSOR_HEALTH.length - 1 ? " readings-health-row--last" : ""}`}>
                <span className="readings-health-name">{s.label}</span>
                <span className={`readings-health-status ${s.statusClass}`}>
                  <span className="readings-health-dot"></span>
                  {s.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Navigation actions */}
        <div className="mp-actions readings-actions">
          <button className="view-button" onClick={() => onNavigate("machine")}>
            ← Back to Machine
          </button>
          <button className="add-machine" onClick={() => onNavigate("copilot")}>
            Factory Copilot ✦
          </button>
        </div>

      </main>

    </div>
  );
}

function ReadingsWithState({ onNavigate }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return <Readings onNavigate={onNavigate} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
}

export default ReadingsWithState;
