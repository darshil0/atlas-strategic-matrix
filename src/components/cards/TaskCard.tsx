// src/components/TaskCard.tsx
import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import { SubTask, TaskStatus, Priority, type Citation } from "@types";
import { ICONS } from "@config";
import {
  Plus,
  ChevronDown,
  ChevronUp,
  Link as LinkIcon,
  Clock,
  Github,
  Ticket,
  Activity,
} from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface TaskCardProps {
  task: SubTask;
  isActive: boolean;
  isBlocked: boolean;
  onClick?: () => void;
  onDecompose?: (id: string) => void;
  onExport?: (id: string, type: "github" | "jira") => void;
  exported?: { github?: string; jira?: string };
  onSimulateFailure?: (id: string) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({
  task,
  isActive,
  isBlocked,
  onClick,
  onDecompose,
  onExport,
  exported,
  onSimulateFailure,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-expand and scroll to active task
  useEffect(() => {
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
      setIsExpanded(true);
      expandButtonRef.current?.focus();
    }
  }, [isActive]);

  const getStatusColor = (status: TaskStatus) => {
    if (isBlocked && status === TaskStatus.PENDING) {
      return "glass-1 border-slate-800/50 opacity-70 cursor-not-allowed backdrop-blur-3xl";
    }
    switch (status) {
      case TaskStatus.COMPLETED:
        return "glass-1 border-emerald-500/40 backdrop-blur-3xl shadow-emerald/20 hover:border-emerald-500/60";
      case TaskStatus.FAILED:
        return "glass-1 border-rose-500/40 backdrop-blur-3xl hover:border-rose-500/60";
      case TaskStatus.IN_PROGRESS:
        return "glass-1 border-atlas-blue/60 backdrop-blur-3xl shadow-[0_0_20px_rgba(59,130,246,0.15)]";
      case TaskStatus.WAITING:
        return "glass-1 border-amber-500/40 backdrop-blur-3xl hover:border-amber-500/60";
      default:
        return "glass-1 border-slate-800/50 backdrop-blur-3xl hover:border-slate-600/50";
    }
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.HIGH:
        return "text-rose-400 border-rose-500/40 bg-rose-500/15 shadow-sm shadow-rose-500/20";
      case Priority.MEDIUM:
        return "text-amber-400 border-amber-500/40 bg-amber-500/15 shadow-sm shadow-amber-500/20";
      case Priority.LOW:
        return "text-atlas-blue border-atlas-blue/40 bg-atlas-blue/15 shadow-sm shadow-atlas-blue/20";
    }
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick?.();
    }
  }, [onClick]);

  const handleExport = useCallback((type: "github" | "jira") => {
    onExport?.(task.id, type);
  }, [onExport, task.id]);

  return (
    <motion.article
      layout
      ref={cardRef}
      role={onClick ? "button" : "article"}
      tabIndex={onClick ? 0 : undefined}
      aria-labelledby={`task-title-${task.id}`}
      aria-expanded={isExpanded}
      aria-describedby={task.result || task.output ? `task-content-${task.id}` : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "rounded-3xl border transition-all duration-300 group overflow-hidden backdrop-blur-3xl focus:outline-none focus:ring-2 focus:ring-atlas-blue focus:ring-offset-2 focus:ring-offset-slate-950/50 shadow-xl hover:shadow-2xl",
        getStatusColor(task.status),
        isActive &&
        "scale-[1.02] z-20 border-atlas-blue/70 shadow-[0_0_40px_rgba(59,130,246,0.25)] ring-2 ring-atlas-blue/40",
        isBlocked && "opacity-70 cursor-not-allowed"
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Main card content */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <motion.div
            className="mt-1 shrink-0 p-2 glass-2 rounded-2xl border border-white/20"
            animate={{
              scale: isActive ? 1.1 : 1,
              rotate: isActive ? 3 : 0
            }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {ICONS[isBlocked ? "BLOCKED" : task.status] || <Clock className="h-5 w-5 text-slate-500" />}
          </motion.div>

          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start mb-4">
              <h3
                id={`task-title-${task.id}`}
                className={cn(
                  "font-display text-xl font-bold leading-tight pr-8",
                  task.status === TaskStatus.COMPLETED
                    ? "text-slate-500/80 line-through"
                    : "text-white group-hover:text-white/90",
                )}
              >
                {task.description}
              </h3>
              <span
                className="font-mono text-xs text-slate-500/80 bg-glass-2 px-3 py-1.5 rounded-2xl border border-white/20 backdrop-blur-xl"
                aria-label={`Task ID: ${task.id}`}
              >
                #{task.id}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center mb-6">
              <span
                className={cn(
                  "px-4 py-2 rounded-2xl text-xs font-mono font-black uppercase tracking-wide border-2 shadow-lg backdrop-blur-sm",
                  getPriorityColor(task.priority),
                )}
                aria-label={`Priority: ${task.priority}`}
              >
                {task.priority.toLowerCase()}
              </span>
              {task.duration && (
                <span className="font-mono text-xs text-slate-400 bg-glass-2 px-4 py-2 rounded-2xl border border-white/20 backdrop-blur-xl flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {task.duration}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-4">
              <span
                className="font-mono text-xs text-slate-500/80 uppercase tracking-widest bg-glass-2 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-xl"
                aria-label={`Category: ${task.category || 'Strategic'}`}
              >
                {task.category || "Strategic"}
              </span>

              <div className="flex gap-3">
                {(task.result || task.output) && (
                  <motion.button
                    ref={expandButtonRef}
                    type="button"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      setIsExpanded((prev) => !prev);
                    }}
                    className={cn(
                      "glass-2 px-6 py-3 border border-white/20 text-xs font-mono font-black uppercase tracking-widest inline-flex items-center gap-2 rounded-2xl transition-all backdrop-blur-xl shadow-lg hover:shadow-xl",
                      isExpanded
                        ? "text-atlas-blue border-atlas-blue/40 bg-atlas-blue/20 hover:bg-atlas-blue/30"
                        : "text-slate-300 hover:text-slate-100 hover:border-white/40 hover:bg-white/10",
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-expanded={isExpanded}
                    aria-controls={`task-content-${task.id}`}
                  >
                    {isExpanded ? (
                      <>
                        Collapse <ChevronUp className="h-3 w-3" />
                      </>
                    ) : (
                      <>
                        Expand <ChevronDown className="h-3 w-3" />
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* Simulation & Actions */}
            <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-white/10">
              {onSimulateFailure && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSimulateFailure(task.id);
                  }}
                  className="glass-2 px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest text-rose-400 border border-rose-500/30 hover:bg-rose-500/10 transition-all flex items-center gap-2 group"
                  title="Simulate task failure to see dependency impact"
                >
                  <Activity className="w-3 h-3 group-hover:animate-pulse" />
                  Simulate Failure
                </button>
              )}

              {onDecompose && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDecompose(task.id);
                  }}
                  className="glass-2 px-4 py-2 rounded-xl text-[10px] font-mono font-black uppercase tracking-widest text-atlas-blue border border-atlas-blue/30 hover:bg-atlas-blue/10 transition-all flex items-center gap-2 group"
                >
                  <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                  Decompose
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expandable content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.section
            id={`task-content-${task.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="glass-2 border-t border-white/20 backdrop-blur-3xl p-6"
          >
            {(task.output || task.result) && (
              <div className="space-y-6 mb-6">
                {task.output && (
                  <div>
                    <h4 className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Expected Output
                    </h4>
                    <div className="glass-2 p-5 rounded-2xl border border-white/20 backdrop-blur-3xl">
                      <p className="text-sm text-slate-200 font-medium leading-relaxed whitespace-pre-wrap">
                        {task.output}
                      </p>
                    </div>
                  </div>
                )}
                {task.result && (
                  <div>
                    <h4 className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      Execution Result
                    </h4>
                    <div className="glass-2 p-5 rounded-2xl border border-white/20 backdrop-blur-3xl max-h-40 overflow-y-auto">
                      <pre className="text-sm text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                        {task.result}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Export buttons */}
            {(onExport || exported) && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <motion.button
                  onClick={() => handleExport("github")}
                  disabled={!!exported?.github}
                  className={cn(
                    "glass-2 group flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all text-sm font-mono font-black backdrop-blur-3xl shadow-xl hover:shadow-2xl",
                    exported?.github
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default shadow-emerald/20"
                      : "border-white/20 hover:border-white/40 hover:bg-white/10 text-slate-300 hover:text-white",
                  )}
                  whileHover={{ scale: exported?.github ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Export to ${exported?.github ? 'GitHub (completed)' : 'GitHub'}`}
                >
                  <Github className={cn("h-6 w-6", exported?.github && "text-emerald-400")} />
                  <span>{exported?.github ? "✅ GitHub" : "GitHub"}</span>
                </motion.button>
                <motion.button
                  onClick={() => handleExport("jira")}
                  disabled={!!exported?.jira}
                  className={cn(
                    "glass-2 group flex flex-col items-center gap-2 p-5 rounded-2xl border transition-all text-sm font-mono font-black backdrop-blur-3xl shadow-xl hover:shadow-2xl",
                    exported?.jira
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 cursor-default shadow-emerald/20"
                      : "border-white/20 hover:border-white/40 hover:bg-white/10 text-slate-300 hover:text-white",
                  )}
                  whileHover={{ scale: exported?.jira ? 1 : 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  aria-label={`Export to ${exported?.jira ? 'Jira (completed)' : 'Jira'}`}
                >
                  <Ticket className={cn("h-6 w-6", exported?.jira && "text-emerald-400")} />
                  <span>{exported?.jira ? "✅ Jira" : "Jira"}</span>
                </motion.button>
              </div>
            )}

            {/* Citations */}
            {task.citations && task.citations.length > 0 && (
              <div>
                <h4 className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  Grounding Citations ({task.citations.length})
                </h4>
                <div className="flex flex-wrap gap-3">
                  {task.citations.slice(0, 3).map((citation: Citation, index: number) => (
                    <motion.a
                      key={index}
                      href={citation.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass-2 inline-flex items-center gap-2 text-sm text-atlas-blue hover:text-white bg-atlas-blue/10 hover:bg-atlas-blue/20 px-5 py-3 rounded-2xl border border-atlas-blue/30 hover:border-atlas-blue/50 transition-all backdrop-blur-xl shadow-lg hover:shadow-xl group"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label={`Source citation: ${citation.title || 'Untitled'}`}
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span className="truncate max-w-[160px] font-mono">
                        {citation.title || `#${index + 1}`}
                      </span>
                    </motion.a>
                  ))}
                  {task.citations.length > 3 && (
                    <span className="glass-2 text-xs text-slate-500 font-mono px-4 py-3 rounded-2xl bg-slate-900/50 border border-white/10 backdrop-blur-xl">
                      +{task.citations.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </motion.section>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export default TaskCard;
