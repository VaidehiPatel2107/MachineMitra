import { useState } from "react";
import Login from "./pages/Login";
import FleetOverview from "./pages/FleetOverview";
import Machine from "./pages/Machine";
import Readings from "./pages/Readings";
import FactoryCopilot from "./pages/FactoryCopilot";
import { LayoutDashboard, Wrench, Activity, Bot, LogOut } from "lucide-react";
import "./App.css";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  // 1. Add state to remember which machine was clicked:
  const [selectedMachineId, setSelectedMachineId] = useState("MM-CNC-001");

  const handleLoginSuccess = (userData) => {
    console.log("Authenticated:", userData);
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onLogin={handleLoginSuccess}
        onSuccess={handleLoginSuccess}
      />
    );
  }

  const renderActivePage = () => {
    switch (currentPage) {
      case "machine":
        return (
          <Machine
            machineId={selectedMachineId} // 2. Pass selected ID here
            onNavigate={setCurrentPage}
            onBack={() => setCurrentPage("dashboard")}
            onNavigateToReadings={() => setCurrentPage("readings")}
            onNavigateToCopilot={() => setCurrentPage("copilot")}
          />
        );
      case "readings":
        return (
          <Readings
            machineId={selectedMachineId}
            onNavigate={setCurrentPage}
            onBack={() => setCurrentPage("dashboard")}
          />
        );
      case "copilot":
        return (
          <FactoryCopilot
            onNavigate={setCurrentPage}
            onBack={() => setCurrentPage("dashboard")}
          />
        );
      case "dashboard":
      default:
        return (
          <FleetOverview
            onNavigate={setCurrentPage}
            // 3. Save the clicked machine's ID before opening the machine page:
            onNavigateToMachine={(machineId) => {
              if (machineId) setSelectedMachineId(machineId);
              setCurrentPage("machine");
            }}
            onNavigateToCopilot={() => setCurrentPage("copilot")}
          />
        );
    }
  };

  const navItems = [
    { id: "dashboard", label: "Fleet Command", icon: LayoutDashboard },
    { id: "machine", label: "Machine Diagnostics", icon: Wrench },
    { id: "readings", label: "Live Telemetry", icon: Activity },
    { id: "copilot", label: "Factory Copilot", icon: Bot, badge: "AI" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={() => setCurrentPage("dashboard")}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold text-slate-900 text-sm tracking-tight leading-none">
                <span>MachineMitra</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                  AI
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium">Predictive IoT Suite</span>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentPage(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-xs border border-slate-200/80"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] px-1 rounded bg-indigo-100 text-indigo-700 font-mono font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>100 Hz Bus</span>
            </div>

            <button
              onClick={() => setIsAuthenticated(false)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
              title="Lock Session / Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {renderActivePage()}
      </main>
    </div>
  );
}