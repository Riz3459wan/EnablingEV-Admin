import { Link } from "react-router";
import { CheckCircle2, Zap } from "lucide-react";
import BrandMark from "../ui/BrandMark";

const AuthShell = ({ title, subtitle, bullets = [], children }) => (
  <div className="fixed inset-0 overflow-hidden bg-[#0a0f1c]">
    {/* ── Background Layer ── */}
    <div className="absolute inset-0">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-blue-500/20 blur-[140px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-cyan-500/15 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-indigo-600/10 blur-[160px]" />
    </div>

    {/* Grid pattern */}
    <div
      className="absolute inset-0 opacity-[0.06]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(96,165,250,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.6) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage:
          "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        WebkitMaskImage:
          "radial-gradient(ellipse at center, black 20%, transparent 75%)",
      }}
    />

    {/* Floating particles */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 rounded-full bg-cyan-400/50 animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 8}s`,
            animationDuration: `${7 + Math.random() * 6}s`,
          }}
        />
      ))}
    </div>

    {/* ── Main Content ── */}
    <div className="relative z-10 h-full flex items-center justify-center p-4">
      <div className="relative w-full max-w-md">
        {/* Glow behind card */}
        <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-indigo-500/30 rounded-3xl blur-2xl opacity-60" />

        <div className="relative bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl shadow-slate-950/50 overflow-hidden">
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />

          <div className="relative p-6 sm:p-7">
            {/* Brand */}
            <div className="flex items-center justify-center gap-2.5 mb-4">
              <BrandMark className="h-8 w-auto" />
              <span className="font-bold text-lg tracking-tight text-white">
                Enabling<span className="text-cyan-400">EV</span>
              </span>
            </div>

            {/* Heading */}
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-2">
                <Zap size={9} className="text-cyan-400" />
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                  Admin Portal
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1 tracking-tight">
                {title}
              </h1>
              <p className="text-slate-400 text-xs">{subtitle}</p>
            </div>

            {/* Form */}
            {children}

            {/* Bullets */}
            {bullets.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5 space-y-1.5">
                {bullets.slice(0, 3).map((b, i) => (
                  <div
                    key={b}
                    className="flex items-start gap-2 text-[10px] text-slate-400"
                  >
                    <CheckCircle2
                      size={11}
                      className="text-cyan-400 shrink-0 mt-0.5"
                    />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bottom accent */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />
        </div>
      </div>
    </div>

    {/* Footer */}
    <div className="absolute bottom-3 left-0 right-0 z-10 text-center">
      <p className="text-[10px] text-slate-500">
        © 2026 Enabling E-Vehicle Private Limited.
      </p>
    </div>
  </div>
);

export default AuthShell;
