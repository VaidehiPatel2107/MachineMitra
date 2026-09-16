import { useState } from "react";
import Login from "./pages/Login";
import FleetOverview from "./pages/FleetOverview";
import FactoryCopilot from "./pages/FactoryCopilot";
import Machine from "./pages/Machine";
import Readings from "./pages/Readings";

function App() {

  const [loggedIn, setLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");

  if (!loggedIn) {
    return (
      <Login
        onLogin={() => setLoggedIn(true)}
      />
    );
  }

  if (activePage === "copilot") {
    return <FactoryCopilot onNavigate={setActivePage} />;
  }

  if (activePage === "machine") {
    return <Machine onNavigate={setActivePage} />;
  }

  if (activePage === "readings") {
    return <Readings onNavigate={setActivePage} />;
  }

  return <FleetOverview onNavigate={setActivePage} />;
}

export default App;