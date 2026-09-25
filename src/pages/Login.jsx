import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  RefreshCw,
  LogOut,
  Building2,
  Server
} from 'lucide-react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [userSession, setUserSession] = useState(null);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    setShowForgotNotice(false);

    // Validation checks
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both work email and credentials.');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setErrorMessage('Please enter a valid engineering or corporate email.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Security policy requires a minimum of 6 characters.');
      return;
    }

    setIsLoading(true);

    // Simulate edge gateway authentication latency
    setTimeout(() => {
      setIsLoading(false);
      const role = email.includes('admin') ? 'Lead Systems Engineer' : 'Shift Operations Specialist';
      const sessionData = {
        email,
        name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
        role,
        gatewayId: 'GW-IND-NODE-04',
        loginTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setUserSession(sessionData);
      if (onLoginSuccess) {
        onLoginSuccess(sessionData);
      }
    }, 1100);
  };

  const handleQuickFill = (roleEmail, rolePass) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setErrorMessage('');
    setShowForgotNotice(false);
  };

  const handleSignOut = () => {
    setUserSession(null);
    setPassword('');
    setErrorMessage('');
  };

  if (userSession) {
    return (
      <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col justify-between items-center p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900">
        {/* Ambient background micro-elements */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-50/60 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-1/4 w-80 h-80 bg-sky-50/70 rounded-full blur-2xl" />
        </div>

        {/* Top bar inside authenticated view */}
        <div className="w-full max-w-xl flex justify-between items-center z-10 pt-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm shadow-sm shadow-indigo-200">
              M
            </div>
            <span className="font-semibold text-slate-900 text-sm tracking-tight">MachineMitra AI</span>
          </div>

          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Gateway Synced
          </span>
        </div>

        {/* Success Card */}
        <div className="w-full max-w-md bg-white border border-slate-200/80 shadow-xl shadow-slate-200/40 rounded-2xl p-8 z-10 my-auto text-center transform transition-all">
          <div className="w-14 h-14 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-5 text-emerald-600 shadow-sm">
            <CheckCircle2 className="w-7 h-7" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Access Granted</h2>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            Authenticated to telemetry bus via <strong className="text-slate-700 font-medium">{userSession.gatewayId}</strong>
          </p>

          <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Operator</span>
              <span className="font-semibold text-slate-800">{userSession.name}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Access Level</span>
              <span className="font-medium text-indigo-700 bg-indigo-50/80 px-2 py-0.5 rounded border border-indigo-100">
                {userSession.role}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500">Node Session Time</span>
              <span className="font-mono text-slate-600">{userSession.loginTime} IST</span>
            </div>
          </div>

         <button
  type="button"
  onClick={() => {
    if (onLoginSuccess) {
      onLoginSuccess(userSession);
    }
  }}
  className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
>
  Proceed to Fleet Command Center &rarr;
</button>

          <button
            onClick={handleSignOut}
            className="w-full py-2 px-3 text-xs text-slate-500 hover:text-slate-800 font-medium rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Switch Operator / Lock Session</span>
          </button>
        </div>

        {/* Footnote */}
        <div className="text-xs text-slate-400 py-3 z-10 flex items-center gap-2">
          <span>MachineMitra Edge OS v2.4</span>
          <span>•</span>
          <span>Security Protocol TLS 1.3</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] text-slate-800 flex flex-col justify-between items-center p-4 sm:p-8 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative">
      {/* Background calm gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 right-1/4 w-[420px] h-[420px] bg-indigo-50/70 rounded-full blur-3xl opacity-70" />
        <div className="absolute bottom-10 left-1/3 w-[380px] h-[380px] bg-slate-100 rounded-full blur-3xl opacity-80" />
      </div>

      {/* Top Header / Status Strip */}
      <header className="w-full max-w-5xl flex justify-between items-center py-2 z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-base shadow-sm shadow-indigo-200 ring-4 ring-indigo-50">
            <Cpu className="w-5 h-5 text-indigo-50" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm tracking-tight">MachineMitra</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-none mt-0.5">Predictive Telemetry Platform</p>
          </div>
        </div>

        {/* Live Operational Beacon */}
        <div className="flex items-center gap-2">
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-600 border border-slate-200/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">Edge Gateway:</span>
            <span className="font-medium text-emerald-700">Operational</span>
          </div>
        </div>
      </header>

      {/* Centered Login Card Container */}
      <main className="w-full max-w-[420px] z-10 my-auto py-6">
        <div className="bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-2xl p-7 sm:p-8 transition-all">
          {/* Card Header */}
          <div className="text-left mb-6">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 mb-3 border border-slate-200/60">
              <Layers className="w-3.5 h-3.5 text-indigo-600" />
              <span>Plant & Fleet Verification</span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sign in to console</h1>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Access real-time machine telemetry, sensor wave diagnostics, and autonomous copilot insights.
            </p>
          </div>

          {/* Validation Alert Banner */}
          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Forgot Password Feedback Banner */}
          {showForgotNotice && (
            <div className="mb-5 p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs flex items-start gap-2.5 animate-fadeIn">
              <Building2 className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="flex-1 leading-normal">
                To reset machine authentication tokens, contact your factory site IT admin or lead security engineer.
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Work Email Field */}
            <div>
              <label htmlFor="login-email" className="block text-xs font-medium text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  placeholder="engineer@machinemitra.io"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  autoComplete="email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-medium text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative rounded-xl border border-slate-200 bg-white hover:border-slate-300 focus-within:border-indigo-600 focus-within:ring-3 focus-within:ring-indigo-100 transition-all">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                  className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  tabIndex="-1"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Keep session active checkbox */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                />
                <span className="text-xs text-slate-600 font-medium">Keep telemetry session active</span>
              </label>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-sm shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Node Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Demo Pills Tray */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Test Credentials
              </span>
              <span className="text-[10px] text-slate-400">1-click fill</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin@machinemitra.io', 'AdminPass#2026')}
                className="py-1.5 px-2.5 text-xs text-left bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-800">Lead Engineer</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">admin@mitra.io</div>
                </div>
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('operator@machinemitra.io', 'Operator#2026')}
                className="py-1.5 px-2.5 text-xs text-left bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 rounded-lg transition-colors flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-800">Shift Operator</div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[110px]">operator@mitra.io</div>
                </div>
                <Activity className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Global Industrial Compliance & Security Footer */}
      <footer className="w-full max-w-5xl z-10 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-200/60">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="font-medium text-slate-700">ISO 27001 Certified</span>
          <span className="text-slate-300">•</span>
          <span>Edge Gateway Encrypted</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="hover:text-slate-600 cursor-pointer">Security Whitepaper</span>
          <span>•</span>
          <span className="hover:text-slate-600 cursor-pointer">Support Desk</span>
          <span>•</span>
          <span>© 2026 MachineMitra AI</span>
        </div>
      </footer>
    </div>
  );
}
