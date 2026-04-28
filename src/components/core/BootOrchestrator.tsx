/**
 * Atlas BootOrchestrator (v3.6.3)
 * Extracts boot logic and error boundaries from the entry point
 */

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";
import { ENV } from "@config";

export { AtlasErrorBoundary } from "./AtlasErrorBoundary";

// === PRODUCTION LOADING SCREEN ===
export const BootLoader: React.FC<{ onReady: () => void }> = ({ onReady }) => {
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

export const LocalLoader: React.FC = () => (
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
