import React, { Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

/**
 * Atlas Strategic Agent (v3.5.0)
 * Glassmorphic Enterprise Orchestrator
 */

// Error Boundary for production resilience
class LocalErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[Atlas] Critical Render Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
          <div className="glass-1 p-8 rounded-3xl border border-white/10 max-w-md backdrop-blur-2xl">
            <h1 className="text-2xl font-bold text-white mb-4">🏛️ Mission Critical Failure</h1>
            <p className="text-slate-400 mb-6 leading-relaxed">
              Atlas encountered a fatal rendering exception. The strategic intelligence pipeline has been suspended.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all font-medium"
            >
              Restart MissionControl
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <LocalErrorBoundary>
        <Suspense fallback={
          <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        }>
          <App />
        </Suspense>
      </LocalErrorBoundary>
    </React.StrictMode>
  );
}

// Production telemetry
console.log("🏛️ ATLAS STRATEGIC v3.5.0 ONLINE");
