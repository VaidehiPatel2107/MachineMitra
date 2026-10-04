import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Sparkles,
  Send,
  RotateCcw,
  Download,
  Paperclip,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Activity,
  Thermometer,
  Zap,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ChevronDown,
  Info,
  Layers,
  Wrench,
  Cpu,
  FileText,
  X
} from 'lucide-react';

// Domain-specific Knowledge & Telemetry Engine
const RESPONSES = {
  vibration: `CNC Machine 01 (**MM-CNC-001**) is currently operating at **2.4 mm/s** vibration velocity, which remains within the **[OPTIMAL]** baseline threshold (< 4.5 mm/s).

**Diagnostic Assessment:**
• **Current RMS Oscillation**: 2.4 mm/s (Peak-to-Peak: 3.2 mm/s)
• **Frequency Domain**: 120 Hz harmonic signature identified on Rotor Axis A
• **Risk Classification**: **[OPTIMAL]** — Low immediate risk of catastrophic spindle failure

**Recommended Actions:**
1. Monitor bearing envelope spectrum for harmonic multiples above 2.8 mm/s.
2. Verify tool holder balance and runout on the next shift handover.
3. Check structural anchor torque levels during the upcoming 30-day maintenance cycle.`,

  temperature: `Live thermal telemetry for **MM-CNC-001** indicates a core spindle temperature of **68.2 °C**.

**Operating Tolerance Guidelines:**
• **40–75 °C** → **[OPTIMAL]** Normal running zone under loaded feed rate.
• **75–85 °C** → **[WARNING]** Thermal expansion warning; inspect coolant circulation and filter mesh.
• **Above 85 °C** → **[CRITICAL]** Automatic feed-hold triggered; potential thermal seizure.

**Advisory:** Post-idle restarts frequently induce transient thermal spikes of +5–7 °C. Allow a 10-minute stabilized cycle before initiating heavy roughing passes.`,

  maintenance: `Upcoming scheduled maintenance for **MM-CNC-001** (Cumulative runtime: 3,420 hours):

• **In 7 Days**: Automated lubrication top-up for X/Y/Z linear guideways & ball screws.
• **In 14 Days**: Coolant filter cartridge replacement and sump concentration check.
• **In 30 Days**: Comprehensive dynamic runout check and spindle bearing inspection.
• **In 90 Days**: Full axis backlash recalibration across all three linear axes.

*Schedule computed based on continuous 16-hour dual-shift operational baseline.*`,

  alerts: `Fleet telemetry scan complete. Found **2 active telemetry flags**:

1. **[WARNING] MM-LTH-002 (Precision Lathe 02)**: Spindle thermal spike detected at 78.4 °C. Coolant delivery pressure is 15% below nominal.
2. **[WARNING] MM-PRS-004 (Hydraulic Press 04)**: Micro-vibration variance detected on hydraulic manifold (3.8 mm/s).

*All other connected units, including MM-CNC-001 and Robotic Cell A, are operating nominal.*`,

  health: `Overall Fleet Health Index is currently calculated at **92%** across all 4 monitored production units.

**Machine Summary:**
• **MM-CNC-001 (5-Axis Milling)**: 94% health — **[OPTIMAL]**
• **MM-LTH-002 (Servo Lathe)**: 76% health — **[WARNING]** (Thermal advisory)
• **MM-ROB-003 (Robotic Cell A)**: 98% health — **[OPTIMAL]**
• **MM-PRS-004 (Hydraulic Press 04)**: 79% health — **[WARNING]** (Oscillation delta)

Edge gateway latency is 12ms with zero packet drop across 100 Hz broker nodes.`,

  fallback: `I have analyzed the real-time sensor streams across MachineMitra's edge gateway. **MM-CNC-001** is currently online with an **Overall Health Score of 94%**.

You can ask me specific questions regarding:
• Live vibration, temperature, or motor power readings
• Historical maintenance intervals and lubrication schedules
• Active sensor alerts and tolerance threshold diagnostics
• Subsystem degradation predictions and tool wear analysis`,
};

function matchKeyword(text) {
  const t = text.toLowerCase();
  if (/vibrat|oscillation|shake|bearing|rotor/i.test(t)) return "vibration";
  if (/temp|heat|thermal|°c|coolant|overheat/i.test(t)) return "temperature";
  if (/maint|sched|service|lubricat|grease|filter|overhaul/i.test(t)) return "maintenance";
  if (/alert|alarm|error|flag|fault|issue|warning/i.test(t)) return "alerts";
  if (/fleet|health|overall|capacity|summary|status/i.test(t)) return "health";
  return "fallback";
}

async function simulateAiResponse(query) {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const category = matchKeyword(query);
  return RESPONSES[category];
}

const PROMPT_CHIPS = [
  { label: "Why is CNC Machine 01 vibrating?", icon: Activity },
  { label: "Explain 85°C alert threshold", icon: Thermometer },
  { label: "When is next ball-screw lubrication?", icon: Wrench },
  { label: "Show active fleet alerts", icon: AlertTriangle },
  { label: "How is the overall fleet health?", icon: CheckCircle2 },
];

let msgCounter = 0;
function createMessage(role, text) {
  return {
    id: ++msgCounter,
    role,
    text,
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    feedback: null, // 'up' | 'down' | null
  };
}

function FormattedMessage({ text }) {
  const lines = text.split("\n");

  return (
    <div className="space-y-2 text-xs sm:text-sm leading-relaxed text-slate-700">
      {lines.map((line, idx) => {
        if (!line.trim()) {
          return <div key={idx} className="h-1.5" />;
        }

        // Render bullet points
        if (line.trim().startsWith("•")) {
          const content = line.trim().slice(1).trim();
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div>{renderFormattedLine(content)}</div>
            </div>
          );
        }

        // Render numbered lists
        if (/^\d+\./.test(line.trim())) {
          const match = line.trim().match(/^(\d+\.)\s*(.*)/);
          return (
            <div key={idx} className="flex items-start gap-2 pl-1">
              <span className="font-semibold text-indigo-600 shrink-0 text-xs mt-0.5">
                {match ? match[1] : '•'}
              </span>
              <div>{renderFormattedLine(match ? match[2] : line)}</div>
            </div>
          );
        }

        return <p key={idx}>{renderFormattedLine(line)}</p>;
      })}
    </div>
  );
}

function renderFormattedLine(line) {
  // Regex to match **bold** text and [TAG] badges
  const parts = line.split(/(\*\*.*?\*\*|\[OPTIMAL\]|\[WARNING\]|\[CRITICAL\])/g);

  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part === "[OPTIMAL]") {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mx-1 align-baseline"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          OPTIMAL
        </span>
      );
    }
    if (part === "[WARNING]") {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 mx-1 align-baseline"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          WARNING
        </span>
      );
    }
    if (part === "[CRITICAL]") {
      return (
        <span
          key={i}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 mx-1 align-baseline"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          CRITICAL
        </span>
      );
    }
    return part;
  });
}

export default function FactoryCopilot({ onNavigate }) {
  const [messages, setMessages] = useState([
    createMessage(
      'assistant',
      `Hello! I am your **Factory Copilot**. I actively track sensor streams, harmonic vibration anomalies, and preventive maintenance intervals across your equipment fleet.

How can I assist you with **CNC Machine 01** or the wider manufacturing cell today?`
    ),
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedMsgId, setCopiedMsgId] = useState(null);
  const [attachedFile, setAttachedFile] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Dynamic textarea expansion
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    let userText = query;
    if (attachedFile) {
      userText = `[Attached: ${attachedFile.name}]\n${query}`;
      setAttachedFile(null);
    }

    const userMessage = createMessage('user', userText);
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setIsLoading(true);

    try {
      const responseText = await simulateAiResponse(query);
      const assistantMessage = createMessage('assistant', responseText);
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 2000);
  };

  const handleFeedback = (id, type) => {
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.id === id) {
          return {
            ...msg,
            feedback: msg.feedback === type ? null : type,
          };
        }
        return msg;
      })
    );
  };

  const handleResetConversation = () => {
    setMessages([
      createMessage(
        'assistant',
        `Conversation context reset. Live sensor bus nodes for **CNC Machine 01** are synchronized. What telemetry parameter would you like to review?`
      ),
    ]);
    setShowResetModal(false);
  };

  const handleExportChat = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      machineTarget: 'CNC Machine 01 (MM-CNC-001)',
      conversation: messages.map((m) => ({
        role: m.role,
        time: m.time,
        text: m.text,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `MachineMitra_Copilot_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileAttach = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 font-sans flex flex-col justify-between selection:bg-indigo-100 selection:text-indigo-900">
      {/* 1. TOP BREADCRUMB & CONTEXT BANNER */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-20 backdrop-blur-md bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span className="hover:text-slate-800 cursor-pointer" onClick={() => onNavigate?.('dashboard')}>
                MachineMitra Platform
              </span>
              <span>/</span>
              <span className="text-slate-800 font-semibold">Factory Copilot</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Factory Copilot</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70">
                  <Sparkles className="w-3 h-3 text-indigo-600" />
                  <span>AI Diagnostic Engine</span>
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowResetModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              title="Clear active context"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Context</span>
            </button>

            <button
              onClick={handleExportChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs"
              title="Download conversation JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Log</span>
            </button>
          </div>
        </div>

        {/* Live Machine Micro-Telemetry Banner */}
        <div className="bg-slate-50/80 border-t border-slate-200/60 px-4 sm:px-6 py-2">
          <div className="max-w-6xl mx-auto flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>CNC Machine 01 (MM-CNC-001)</span>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-500">
                Core Temp: <strong className="text-slate-800 font-medium">68.2 °C</strong>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-500">
                Vibration: <strong className="text-slate-800 font-medium">2.4 mm/s</strong>
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-slate-500">
                Health Index: <strong className="text-emerald-700 font-semibold">92%</strong>
              </span>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Edge Bus Rate: 100 Hz</span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. CHAT CONVERSATION VIEWPORT */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between">
        <div className="space-y-4 mb-6">
          {messages.map((message) => {
            const isAssistant = message.role === 'assistant';

            return (
              <div
                key={message.id}
                className={`flex gap-3 items-start ${
                  isAssistant ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Assistant Avatar */}
                {isAssistant && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                  </div>
                )}

                {/* Message Bubble Card */}
                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 sm:p-5 shadow-xs border transition-all ${
                    isAssistant
                      ? 'bg-white border-slate-200/90 text-slate-800'
                      : 'bg-indigo-50/90 border-indigo-200/80 text-slate-900 ml-auto'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3 mb-2 pb-1.5 border-b border-slate-100 text-[11px]">
                    <span className="font-semibold text-slate-600">
                      {isAssistant ? 'MachineMitra Copilot' : 'Engineer (You)'}
                    </span>
                    <span className="text-slate-400 font-mono">{message.time}</span>
                  </div>

                  <div className="break-words">
                    <FormattedMessage text={message.text} />
                  </div>

                  {/* Assistant Feedback & Copy Bar */}
                  {isAssistant && (
                    <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                      <span className="text-[11px]">Telemetry Validated</span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyMessage(message.id, message.text)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Copy response to clipboard"
                        >
                          {copiedMsgId === message.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-[11px] text-emerald-600 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span className="text-[11px]">Copy</span>
                            </>
                          )}
                        </button>

                        <div className="w-px h-3.5 bg-slate-200 mx-1" />

                        <button
                          onClick={() => handleFeedback(message.id, 'up')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            message.feedback === 'up'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Helpful insight"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleFeedback(message.id, 'down')}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            message.feedback === 'down'
                              ? 'bg-rose-50 text-rose-700'
                              : 'hover:bg-slate-100 text-slate-400 hover:text-slate-700'
                          }`}
                          title="Unhelpful / Inaccurate"
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar */}
                {!isAssistant && (
                  <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-semibold text-xs shrink-0 mt-0.5 shadow-xs">
                    EN
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex gap-3 items-start justify-start">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200/80 text-indigo-600 flex items-center justify-center shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
              </div>

              <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.3s]" />
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  Analyzing edge telemetry buffer & oscillation logs...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 3. PROMPT SUGGESTION PILLS & INPUT DOCK */}
        <div className="sticky bottom-4 pt-2">
          {/* Prompt Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-2 scrollbar-none">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Suggested Queries:
            </span>
            {PROMPT_CHIPS.map((chip, idx) => {
              const IconComponent = chip.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip.label)}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-slate-100 active:bg-slate-200 text-slate-700 border border-slate-200/90 transition-colors shadow-2xs shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <IconComponent className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span>{chip.label}</span>
                </button>
              );
            })}
          </div>

          {/* Attachment Preview Chip */}
          {attachedFile && (
            <div className="mb-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800">
              <FileText className="w-3.5 h-3.5 text-indigo-600" />
              <span>{attachedFile.name} ({attachedFile.size})</span>
              <button
                onClick={() => setAttachedFile(null)}
                className="p-0.5 hover:bg-indigo-100 rounded text-indigo-600"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Floating Input Dock */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 sm:p-2.5 shadow-lg shadow-slate-200/50 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100">
            <div className="flex items-end gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Attach machine log or spectrum waveform"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileAttach}
                className="hidden"
                accept=".csv,.txt,.json,.log"
              />

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask about machine health, thermal spikes, lubrication schedules..."
                disabled={isLoading}
                className="flex-1 bg-transparent border-0 outline-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 resize-none py-2 px-1 max-h-36"
              />

              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || (!inputValue.trim() && !attachedFile)}
                className="p-2 sm:px-3.5 sm:py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-xs sm:text-sm font-medium transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shrink-0"
              >
                <span className="hidden sm:inline">Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="hidden sm:flex justify-between items-center px-2 pt-1.5 border-t border-slate-100 text-[11px] text-slate-400">
              <span>Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">Enter ↵</kbd> to submit query</span>
              <span><kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] text-slate-600">Shift + Enter</kbd> for multi-line</span>
            </div>
          </div>
        </div>
      </main>

      {/* 4. CONFIRMATION RESET MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-5 shadow-2xl animate-scale-up">
            <h3 className="text-base font-bold text-slate-900">Reset Conversation History?</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              This will clear the current telemetry discussion thread and re-initialize machine context.
            </p>
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetConversation}
                className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}