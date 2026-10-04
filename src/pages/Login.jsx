import React, { useState } from "react";
import { Lock, Mail, ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      if (onLoginSuccess) {
        onLoginSuccess({ email: email || "operator@machinemitra.io" });
      }
    }, 600);
  };

  return (
    <div className="min-h-screen w-full bg-[#0a0f1d] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Lighting Accents */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        
        {/* Enterprise Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-black text-3xl shadow-xl shadow-indigo-600/30 mb-4 ring-4 ring-indigo-500/20">
            <Cpu className="w-9 h-9 text-white stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-white tracking-tight">MachineMitra</h1>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              AI
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Autonomous Factory Telemetry & Predictive Analytics
          </p>
        </div>

        {/* Clean Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@factorydomain.io"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                Access Token / Password
              </label>
              <a href="#forgot" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Reset key?
              </a>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-11 pr-4 py-3 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 focus:ring-offset-0"
              />
              <span>Remember station session</span>
            </label>
            <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5" /> TLS 1.3 Guarded
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70"
          >
            {isSubmitting ? (
              <span>Authenticating Edge Bus...</span>
            ) : (
              <>
                <span>Sign In to Station</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-8 text-xs text-slate-500 text-center">
        MachineMitra v2.4-RT Prototype • Industrial Grade Precision Telemetry
      </p>
    </div>
  );
}