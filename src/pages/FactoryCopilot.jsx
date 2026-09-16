import { useState, useRef, useEffect } from "react";
import "../App.css";

// ─── Dummy response engine ────────────────────────────────────────────────────
// Replace getResponse() with a real fetch() call when the backend is ready.
// Signature must stay: (userText: string) => Promise<string>

const RESPONSES = {
  vibration: `CNC Machine 01 (MM-CNC-001) is currently reading 2.4 mm/s — within the normal range (< 4.5 mm/s). However, a sustained increase above 3.5 mm/s typically indicates early bearing wear. Recommended actions:\n1. Inspect spindle bearings at next scheduled maintenance.\n2. Check tool-holder balance and run-out.\n3. Verify that the machine is level and properly anchored.`,

  temperature: `Current temperature on MM-CNC-001 is 68 °C. Normal operating range for this machine is 40–75 °C.\n• 75–85 °C → Warning: check coolant flow and filter.\n• Above 85 °C → Critical: stop the machine and inspect the cooling system immediately.\n\nTip: Temperature spikes after idle restarts are common; monitor for 15 minutes before escalating.`,

  maintenance: `Upcoming maintenance schedule for MM-CNC-001:\n• **7 days** — Lubrication of linear guides and ball screws.\n• **14 days** — Coolant filter replacement.\n• **30 days** — Full spindle inspection and spindle bearing check.\n• **90 days** — Ball screw backlash measurement and calibration.\n\nAll tasks are estimated from last service date (15 Jun 2025). Adjust if operating hours deviate from baseline.`,

  alert: `There are currently 2 active alerts on the fleet:\n1. **MM-CNC-001 — Coolant Level Low** (raised 2 hours ago): Top up the coolant reservoir. Minimum safe level is 3 L.\n2. **MM-CNC-001 — Tool Wear Threshold Reached** (raised 5 hours ago): Tool #3 (end mill Ø10mm) has exceeded 80% wear. Replace before the next long job.\n\nNo alerts on any other machines.`,

  fallback: `I've reviewed the current fleet data for MachineMitra. MM-CNC-001 is online and running at 92% health. All other monitored parameters are within normal ranges.\n\nCould you clarify your question? For example, you can ask about:\n• Vibration or temperature readings\n• Maintenance schedules\n• Active alerts or errors\n• Specific machine performance`,
};

function matchKeyword(text) {
  const t = text.toLowerCase();
  if (/vibrat/.test(t)) return "vibration";
  if (/temp(erature)?|heat|cool|°c/.test(t)) return "temperature";
  if (/maintenan|schedul|service|lubrication/.test(t)) return "maintenance";
  if (/alert|error|warning|fault|alarm/.test(t)) return "alert";
  return "fallback";
}

async function getResponse(userText) {
  // Simulates network latency — remove the delay when using a real API.
  await new Promise((resolve) => setTimeout(resolve, 900));
  return RESPONSES[matchKeyword(userText)];
}
// ─────────────────────────────────────────────────────────────────────────────

const EXAMPLE_PROMPTS = [
  "Why is CNC Machine 01 vibrating?",
  "What does a temperature of 85 °C mean?",
  "When is the next maintenance due?",
  "Show me active alerts",
  "How is the overall fleet health?",
];

let msgIdCounter = 0;
function makeMsg(role, text) {
  return { id: ++msgIdCounter, role, text };
}

function FactoryCopilot({ onNavigate, sidebarOpen, setSidebarOpen }) {
  const [messages, setMessages] = useState([
    makeMsg(
      "assistant",
      "Hello! I'm your Factory Copilot. Ask me anything about your machines — health status, maintenance schedules, alerts, or sensor readings."
    ),
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function sendMessage(text) {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setMessages((prev) => [...prev, makeMsg("user", trimmed)]);
    setInputValue("");
    setIsLoading(true);

    try {
      const reply = await getResponse(trimmed);
      setMessages((prev) => [...prev, makeMsg("assistant", reply)]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  }

  function handlePromptChip(prompt) {
    sendMessage(prompt);
  }

  return (
    <div className={`dashboard ${sidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>

      {/* Sidebar — mirrors FleetOverview exactly */}
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

          <a className="nav-item" href="#">
            <span className="nav-icon">▥</span>
            {sidebarOpen && <span>Readings</span>}
          </a>

          <a className="nav-item active" href="#">
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
            <h1>Factory Copilot</h1>
            <p>AI-powered maintenance assistant for your machines</p>
          </div>

          <div className="user-profile">
            <div className="profile-icon">A</div>
            <div>
              <strong>Admin</strong>
              <span>Administrator</span>
            </div>
          </div>
        </header>

        {/* Copilot Chat Area */}
        <section className="copilot-page">

          {/* AI Badge + description */}
          <div className="copilot-header">
            <span className="copilot-ai-badge">✦ AI</span>
            <p className="copilot-description">
              Ask about machine health, sensor readings, maintenance schedules, or active alerts.
            </p>
          </div>

          {/* Example prompt chips */}
          <div className="copilot-prompts">
            {EXAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                className="prompt-chip"
                onClick={() => handlePromptChip(prompt)}
                disabled={isLoading}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message thread */}
          <div className="copilot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`msg-row msg-row--${msg.role}`}>
                {msg.role === "assistant" && (
                  <div className="msg-avatar">✦</div>
                )}
                <div className={`msg-bubble msg-bubble--${msg.role}`}>
                  {msg.text.split("\n").map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split("\n").length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="msg-row msg-row--assistant">
                <div className="msg-avatar">✦</div>
                <div className="msg-bubble msg-bubble--assistant typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input bar */}
          <div className="copilot-input-bar">
            <textarea
              ref={textareaRef}
              className="copilot-textarea"
              placeholder="Ask about your machines… (Enter to send, Shift+Enter for new line)"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              disabled={isLoading}
            />
            <button
              className="copilot-send-btn"
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
            >
              Send
            </button>
          </div>

        </section>

      </main>

    </div>
  );
}

export default FactoryCopilot;
