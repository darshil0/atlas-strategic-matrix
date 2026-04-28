/**
 * Atlas Error Boundary (v3.6.1)
 * Centralized React error boundary for MissionControl → Glassmorphic UI
 */

import React from "react";
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
export const AtlasErrorBoundary: React.FC<{ children: React.ReactNode }> = ({
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
