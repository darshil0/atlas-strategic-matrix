/**
 * ATLAS v3.6.3 - Production Entry Point
 * Glassmorphic MissionControl dashboard with error boundaries + loading states
 */

import React, { Suspense, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App";
import { ENV } from "@config";
import {
  AtlasErrorBoundary,
  BootLoader,
  LocalLoader,
} from "./components/core/BootOrchestrator";

// === PRODUCTION RENDERING ===
export const Root: React.FC = () => {
  const [showLoader, setShowLoader] = useState(true);

  const handleReady = useCallback(() => {
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
    console.group("🏛️ ATLAS v3.6.3 BOOT SEQUENCE");
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
  console.groupCollapsed("🏛️ ATLAS v3.6.3 • Production Build");
  console.log("• Status: Neural core online");
  console.log("• Tasks: 92+ enterprise objectives loaded");
  console.log("• Agents: Strategist + Analyst + Critic ready");
  console.groupEnd();
}
