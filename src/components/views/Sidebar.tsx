import React from "react";
import { AnimatePresence } from "framer-motion";
import {
  Settings,
  Database,
  ShieldCheck,
  Activity,
  Zap,
  Clock,
  CloudLightning,
  Terminal
} from "lucide-react";
import { cn } from "@lib/utils";
import { Plan, SubTask } from "@types";
import TaskCard from "../cards/TaskCard";
import DependencyGraph from "./DependencyGraph";
import TimelineView from "./TimelineView";

export type SidebarViewType = "list" | "graph" | "timeline";

interface SidebarProps {
  currentPlan: Plan | null;
  activeTaskId: string | null;
  startDate?: Date; // For TimelineView if needed
  
  // State
  sidebarView: SidebarViewType;
  setSidebarView: (view: SidebarViewType) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  isTaskBankOpen: boolean;
  setIsTaskBankOpen: (open: boolean) => void;
  
  // Actions
  onTaskClick: (taskId: string) => void;
  onDecompose: (taskId: string) => void;
  onExportTask: (taskId: string, type: "github" | "jira") => void;
  exportedTasks: Record<string, { github?: string; jira?: string }>;
  
  // Graph / Simulation
  isTaskBlocked: (task: SubTask, allTasks: SubTask[]) => boolean;
  onLinkDependency: (source: string, target: string) => void;
  
  isWhatIfEnabled: boolean;
  setIsWhatIfEnabled: (enabled: boolean) => void;
  simulationResult: {
    cascade: string[];
    riskScore: number;
    impactedHighPriority: number;
  } | null;
  setSimulationResult: (result: SidebarProps["simulationResult"]) => void;
  onSimulateFailure: (taskId: string) => Promise<void>;
  
  // Refs
  taskRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
}

export const Sidebar: React.FC<SidebarProps> =({
  currentPlan,
  activeTaskId,
  sidebarView,
  setSidebarView,
  setIsSettingsOpen,
  setIsTaskBankOpen,
  onTaskClick,
  onDecompose,
  onExportTask,
  exportedTasks,
  isTaskBlocked,
  onLinkDependency,
  isWhatIfEnabled,
  setIsWhatIfEnabled,
  simulationResult,
  setSimulationResult,
  onSimulateFailure,
  taskRefs
}) => {
  return (
    <aside className="w-[450px] flex flex-col border-r border-white/5 bg-slate-950/50 backdrop-blur-3xl z-30 h-full">
      <header className="p-6 border-b border-white/10 glass-1">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 glass-2 rounded-2xl flex items-center justify-center border border-white/20 shadow-lg shadow-atlas-blue/20">
              <ShieldCheck className="text-atlas-blue h-6 w-6" />
            </div>
            <h1 className="font-display font-black text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-slate-500">
              ATLAS STRATEGIC <span className="text-atlas-blue text-xs align-top ml-1 font-mono tracking-widest opacity-80">v3.6.1</span>
            </h1>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 glass-2 rounded-xl border border-white/10 hover:border-white/30 text-slate-400 hover:text-white transition-all active:scale-95"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>

        <div className="flex p-1.5 glass-2 rounded-2xl border border-white/5 shadow-inner">
          {[
            { id: "list", label: "Roadmap", icon: Activity },
            { id: "graph", label: "Network", icon: Zap },
            { id: "timeline", label: "Timeline", icon: Clock },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSidebarView(tab.id as SidebarViewType)}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-mono font-black uppercase tracking-widest transition-all",
                sidebarView === tab.id
                  ? "glass-2 text-atlas-blue shadow-lg ring-1 ring-atlas-blue/20"
                  : "text-slate-500 hover:text-slate-200"
              )}
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8 space-y-8 scroll-smooth scrollbar-hide">
        {sidebarView === "list" && currentPlan && (
          <AnimatePresence mode="popLayout">
            {currentPlan.tasks.map((task: SubTask) => (
              <div key={task.id} ref={(el: HTMLDivElement | null) => { if (taskRefs.current) taskRefs.current[task.id] = el; }}>
                <TaskCard
                  task={task}
                  isActive={activeTaskId === task.id}
                  isBlocked={isTaskBlocked(task, currentPlan.tasks)}
                  onClick={() => onTaskClick(task.id)}
                  onDecompose={onDecompose}
                  onExport={onExportTask}
                  exported={exportedTasks[task.id]}
                  onSimulateFailure={() => onSimulateFailure(task.id)}
                />
              </div>
            ))}
          </AnimatePresence>
        )}

        {sidebarView === "graph" && currentPlan && (
          <div className="h-full min-h-[600px] rounded-3xl border border-white/10 overflow-hidden relative group">
            <DependencyGraph
              tasks={currentPlan.tasks}
              activeTaskId={activeTaskId}
              onTaskSelect={onTaskClick}
              isTaskBlocked={(t, all) => isTaskBlocked(t, all)}
              onConnect={onLinkDependency}
              isWhatIfEnabled={isWhatIfEnabled}
              simulationResult={simulationResult}
              onSimulateFailure={onSimulateFailure}
            />
            <div className="absolute top-6 left-6 flex gap-3">
              <button
                onClick={() => setIsWhatIfEnabled(!isWhatIfEnabled)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest border transition-all flex items-center gap-2 backdrop-blur-xl shadow-2xl",
                  isWhatIfEnabled
                    ? "bg-rose-500/20 text-rose-400 border-rose-500/50"
                    : "glass-2 text-slate-400 border-white/10 hover:border-white/30"
                )}
              >
                <CloudLightning className="w-3 h-3" />
                What-If Mode {isWhatIfEnabled ? 'ON' : 'OFF'}
              </button>
              {simulationResult && (
                <button
                  onClick={() => setSimulationResult(null)}
                  className="glass-2 px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest border border-white/10 text-slate-400 hover:text-white transition-all backdrop-blur-xl"
                >
                  Clear Analytics
                </button>
              )}
            </div>
          </div>
        )}

        {sidebarView === "timeline" && currentPlan && (
          <TimelineView plan={currentPlan} activeTaskId={activeTaskId} />
        )}

        {!currentPlan && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
            <div className="h-20 w-20 glass-2 rounded-[2.5rem] flex items-center justify-center border border-white/10 shadow-2xl relative">
              <div className="absolute inset-0 bg-atlas-blue/10 blur-2xl rounded-full animate-pulse" />
              <Terminal className="text-slate-700 h-10 w-10 relative z-10" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">No Active Roadmap</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-mono">
                Enter a strategic directive to generate an autonomous enterprise roadmap for 2026.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="p-4 border-t border-white/10 bg-black/20">
        <button
          onClick={() => setIsTaskBankOpen(true)}
          className="w-full py-4 glass-2 rounded-2xl border border-white/10 hover:border-white/30 transition-all flex items-center justify-center gap-3 text-xs font-mono font-black uppercase tracking-widest text-slate-400 hover:text-white shadow-lg"
        >
          <Database className="h-4 w-4" />
          Strategic Task Bank
        </button>
      </footer>
    </aside>
  );
};
