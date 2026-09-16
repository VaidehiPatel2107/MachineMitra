import { useState } from "react";
import Login from "./pages/Login";
import FleetOverview from "./pages/FleetOverview";
import FactoryCopilot from "./pages/FactoryCopilot";

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

  return <FleetOverview onNavigate={setActivePage} />;
}

export default App;