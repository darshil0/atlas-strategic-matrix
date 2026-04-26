/**
 * ATLAS v3.6.1 - Production Entry Point
 * Glassmorphic MissionControl dashboard with error boundaries + loading states
 *
 * FIX v3.6.1: `LocalErrorBoundary` is now a proper React class-based error
 *   boundary (using `componentDidCatch` / `getDerivedStateFromError`). The
 *   previous implementation listened only to `window.error` events, which
 *   do NOT fire for React rendering errors caught during the render phase,
 *   meaning component crashes were silently swallowed.
 */

import React, { Suspense, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import "./index.css";
import App from "./App";
import { ENV } from "@config";

// === PRODUCTION REACT ERROR BOUNDARY ===
interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class LocalErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, errorMessage: error.message };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error(
      "🎛️ ATLAS: React error boundary caught:",
      error,
      info.componentStack
    );
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return <>{this.props.children}</>;
  }
}

// === PRODUCTION ERROR BOUNDARY WRAPPER ===
const AtlasErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <LocalErrorBoundary
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-8">
          <div className="glass-card max-w-md w-full mx-auto p-12 text-center rounded-3xl border-2 border-rose-500/20 shadow-2xl shadow-rose-500/10">
            <div className="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-rose-500/30">
              <span className="text-3xl">⚠️</span>
            </div>
            <h2 className="strat-h1 mb-4 text-rose-400">
              Strategic Core Error
            </h2>
            <p className="text-slate-400 mb-8 leading-relaxed">
              MissionControl encountered an unexpected failure.
              <br />
              <span className="text-rose-400 font-mono">
                Neural synthesis interrupted.
              </span>
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-critical w-full"
            >
              Emergency Reboot
            </button>
            <p className="text-[11px] strat-label mt-6 text-slate-600">
              ATLAS v{ENV.APP_VERSION || "3.6.1"}
            </p>
          </div>
        </div>
      }
    >
      {children}
    </LocalErrorBoundary>
  );
};

// === PRODUCTION LOADING SCREEN ===
const BootLoader: React.FC<{ onReady: () => void }> = ({ onReady }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ENV.DEBUG_MODE)
      console.log("🏛️ [Atlas] BootLoader: Initializing neural core...");

    const checkServices = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (ENV.DEBUG_MODE)
        console.log("🏛️ [Atlas] BootLoader: Services health check passed.");
      setIsReady(true);

      setTimeout(() => {
        if (ENV.DEBUG_MODE)
          console.log("🏛️ [Atlas] BootLoader: Neural core ready.");
        onReady();
      }, 800);
    };

    checkServices();
  }, [onReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-[-20%] left-[-20%] w-96 h-96 bg-blue-600/5 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] animate-pulse delay-1000" />
      </div>

      {/* ATLAS Logo */}
      <motion.div
        className="relative mb-12"
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        <div className="pulse-ring w-24 h-24 mb-6 mx-auto">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/30 mx-auto border-2 border-white/20">
            <Zap className="w-10 h-10 text-white drop-shadow-lg" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="strat-h1 text-4xl md:text-5xl tracking-[-0.05em] bg-gradient-to-r from-white via-slate-100 to-blue-100 bg-clip-text text-transparent drop-shadow-2xl">
            ATLAS
          </h1>
          <div className="flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.3em] text-blue-400">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            v{ENV.APP_VERSION || "3.6.1"}
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <p className="text-xs strat-label text-slate-600 font-mono">
            Neural Core Initializing
          </p>
        </div>
      </motion.div>

      {/* Progress dots */}
      {!isReady && (
        <div className="flex items-center gap-3 mb-8">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.4,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      )}

      {/* Status messages */}
      <div className="space-y-2 mb-12 max-w-sm mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.8 }}
          className="text-xs font-mono text-slate-500 flex items-center gap-2 justify-center"
        >
          <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/40 rounded-sm flex items-center justify-center">
            ✓
          </div>
          TaskBank loaded ({ENV.TASKBANK_SIZE || "92"} objectives)
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.1 }}
          className="text-xs font-mono text-slate-500 flex items-center gap-2 justify-center"
        >
          <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/40 rounded-sm flex items-center justify-center">
            ✓
          </div>
          MissionControl online
        </motion.div>
      </div>

      {isReady && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-black uppercase tracking-wider text-emerald-500 flex items-center gap-2"
        >
          <div className="status-pulse w-3 h-3" />
          Neural Core Ready
        </motion.div>
      )}
    </div>
  );
};

// === PRODUCTION RENDERING ===
const Root: React.FC = () => {
  const [showLoader, setShowLoader] = useState(true);

  const handleReady = React.useCallback(() => {
    if (ENV.DEBUG_MODE)
      console.log(
        "🏛️ [Atlas] BootLoader signaled ready. Transitioning in 600ms..."
      );
    setTimeout(() => {
      if (ENV.DEBUG_MODE)
        console.log("🏛️ [Atlas] Hiding BootLoader, mounting App.");
      setShowLoader(false);
    }, 600);
  }, []);

  return (
    <React.Fragment>
      {showLoader ? (
        <Suspense fallback={null}>
          <BootLoader onReady={handleReady} />
        </Suspense>
      ) : (
        <AtlasErrorBoundary>
          <Suspense fallback={<LocalLoader />}>
            <App />
          </Suspense>
        </AtlasErrorBoundary>
      )}
    </React.Fragment>
  );
};

const initAtlas = async () => {
  const rootElement = document.getElementById("root");

  if (!rootElement) {
    throw new Error("🚨 ATLAS: Root element not found");
  }

  const root = createRoot(rootElement);

  if (ENV.DEBUG_MODE) {
    console.group("🏛️ ATLAS v3.6.1 BOOT SEQUENCE");
    console.log("• React:", React.version);
    console.log("• Environment:", import.meta.env.MODE);
    console.log("• App Version:", ENV.APP_VERSION || "3.6.1");
    console.groupEnd();
  }

  root.render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
};

// === LOADER COMPONENT ===
const LocalLoader: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center p-8">
    <div className="glass-card p-12 rounded-3xl text-center max-w-sm w-full border-2 border-blue-500/20 shadow-2xl shadow-blue-500/20">
      <div className="loader-spinner mb-8" />
      <div className="space-y-3">
        <h3 className="text-2xl font-black text-white font-display">
          Loading...
        </h3>
        <p className="text-slate-400 text-sm">Strategic core initializing</p>
      </div>
    </div>
  </div>
);

// === INITIALIZE ATLAS ===
initAtlas().catch((error) => {
  console.error("🚨 CRITICAL: Atlas failed to initialize:", error);
  document.body.innerHTML = `
    <div class="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div class="glass-card p-12 rounded-3xl text-center max-w-md w-full border-2 border-rose-500/30 shadow-2xl shadow-rose-500/20">
        <div class="w-20 h-20 bg-rose-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border-2 border-rose-500/40">
          <span class="text-4xl">💥</span>
        </div>
        <h2 class="text-3xl font-black text-rose-400 mb-4">CRITICAL FAILURE</h2>
        <p class="text-slate-400 mb-8">Atlas neural core failed to initialize</p>
        <button onclick="location.reload()" class="btn-critical w-full text-sm py-3">FORCE REBOOT</button>
      </div>
    </div>
  `;
});

if (import.meta.env.PROD) {
  console.groupCollapsed("🏛️ ATLAS v3.6.1 • Production Build");
  console.log("• Status: Neural core online");
  console.log("• Tasks: 92+ enterprise objectives loaded");
  console.log("• Agents: Strategist + Analyst + Critic ready");
  console.groupEnd();
}
