import React, { useState } from "react";
import Login from "./pages/Login";
import FleetOverview from "./pages/FleetOverview";
import Machine from "./pages/Machine";
import Readings from "./pages/Readings";
import FactoryCopilot from "./pages/FactoryCopilot";
import { LayoutDashboard, Activity, Bot, LogOut } from "lucide-react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedMachineId, setSelectedMachineId] = useState("MM-DRL-001");

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case "machine":
        return (
          <Machine
            machineId={selectedMachineId}
            onNavigateToFleet={() => setCurrentPage("dashboard")}
            onNavigateToReadings={() => setCurrentPage("readings")}
            onNavigateToCopilot={() => setCurrentPage("copilot")}
          />
        );
      case "readings":
        return (
          <Readings
            machineId={selectedMachineId}
            onNavigateToFleet={() => setCurrentPage("dashboard")}
          />
        );
      case "copilot":
        return (
          <FactoryCopilot
            onBack={() => setCurrentPage("dashboard")}
          />
        );
      case "dashboard":
      default:
        return (
          <FleetOverview
            onNavigateToMachine={(machineId) => {
              if (machineId) setSelectedMachineId(machineId);
              setCurrentPage("machine");
            }}
            onNavigateToReadings={() => setCurrentPage("readings")}
            onNavigateToCopilot={() => setCurrentPage("copilot")}
          />
        );
    }
  };

  const navItems = [
    { id: "dashboard", label: "Fleet Command", icon: LayoutDashboard },
    { id: "readings", label: "Live Telemetry", icon: Activity },
    { id: "copilot", label: "Factory Copilot", icon: Bot, badge: "AI" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col w-full antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Fluid Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 lg:px-12 py-3.5 shadow-xs">
        <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div 
            onClick={() => setCurrentPage("dashboard")}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
              M
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 text-lg tracking-tight">MachineMitra</span>
                <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">Industrial IoT Telemetry Suite</p>
            </div>
          </div>

          {/* Navigation Bar */}
          <nav className="flex items-center gap-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/70">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700 font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Sign Out */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-rose-200"
              title="Lock Session / Log Out"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs font-semibold hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        {renderActivePage()}
      </main>
    </div>
  );
}