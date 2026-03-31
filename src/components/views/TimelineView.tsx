// src/components/TimelineView.tsx
import React from "react";
import { motion } from "framer-motion";
import { Plan, SubTask, TaskStatus } from "@types";
import { CheckCircle2, Clock, ArrowRight } from "lucide-react";
import { cn } from "@lib/utils";

interface TimelineViewProps {
  plan: Plan;
  activeTaskId: string | null;
}

const TimelineView: React.FC<TimelineViewProps> = ({ plan, activeTaskId }) => {
  const sortedTasks = React.useMemo(
    () => [...plan.tasks].sort((a: SubTask, b: SubTask) => a.id.localeCompare(b.id)),
    [plan.tasks]
  );

  const getStatusColor = (task: SubTask) => {
    const isBlocked = task.status === TaskStatus.PENDING && (task.dependencies?.length || 0) > 0;

    if (isBlocked) {
      return "glass-1 border-slate-800/60 backdrop-blur-3xl opacity-70 shadow-slate/10";
    }

    switch (task.status) {
      case TaskStatus.COMPLETED:
        return "glass-1 border-emerald-500/50 backdrop-blur-3xl shadow-emerald/25 hover:border-emerald-500/70";
      case TaskStatus.IN_PROGRESS:
        return "glass-1 border-atlas-blue/70 backdrop-blur-3xl shadow-[0_0_25px_rgba(59,130,246,0.2)] animate-pulse";
      case TaskStatus.WAITING:
        return "glass-1 border-amber-500/50 backdrop-blur-3xl shadow-amber/20 hover:border-amber-500/70";
      default:
        return "glass-1 border-slate-800/60 backdrop-blur-3xl hover:border-slate-700/70 shadow-slate/10";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto overflow-x-hidden p-8 glass-2 rounded-3xl border border-white/10 backdrop-blur-3xl no-scrollbar shadow-2xl"
      role="region"
      aria-label="Strategic timeline"
      tabIndex={-1}
    >
      <div className="relative min-h-full">
        {/* Timeline connector */}
        <div
          className="absolute left-14 top-0 bottom-0 w-px bg-gradient-to-b from-atlas-blue/30 via-slate-800/50 to-slate-900/30 shadow-sm"
          aria-hidden="true"
          role="presentation"
        />

        <ol className="space-y-12 relative z-10" role="list">
          {sortedTasks.map((task: SubTask, index: number) => {
            const isActive = activeTaskId === task.id;
            const isLast = index === sortedTasks.length - 1;

            return (
              <motion.li
                key={task.id}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "flex gap-8 items-start transition-all duration-500 group",
                  isActive && "[&>*]:ring-2 [&>*]:ring-atlas-blue/40 [&>*]:shadow-[0_0_40px_rgba(59,130,246,0.2)]"
                )}
                id={`timeline-task-${task.id}`}
              >
                {/* Timeline marker */}
                <motion.div
                  className="relative z-20 flex-shrink-0 mt-3 w-14"
                  role="img"
                  aria-label={`${task.status} indicator for task ${task.id}`}
                  animate={isActive ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-3xl flex items-center justify-center border-2 shadow-2xl transition-all duration-500 ring-1 ring-transparent backdrop-blur-3xl",
                      getStatusColor(task),
                      isActive && "ring-atlas-blue/50 shadow-[0_0_40px_rgba(59,130,246,0.3)]"
                    )}
                  >
                    {task.status === TaskStatus.COMPLETED ? (
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" aria-hidden="true" />
                    ) : (
                      <span className="font-mono font-black text-lg leading-none tracking-tight text-slate-200 drop-shadow-lg">
                        {task.id.slice(-2)}
                      </span>
                    )}
                  </div>

                  {/* Connector to next item */}
                  {!isLast && (
                    <div
                      className="absolute left-1/2 top-full -translate-x-1/2 w-px h-12 bg-gradient-to-b from-slate-800/50 to-transparent"
                      aria-hidden="true"
                    />
                  )}
                </motion.div>

                {/* Task content */}
                <motion.article
                  className={cn(
                    "flex-1 p-8 rounded-3xl border backdrop-blur-3xl transition-all duration-500 shadow-2xl group-hover:shadow-3xl flex-1 max-w-4xl",
                    isActive
                      ? "glass-1 border-atlas-blue/50 shadow-[0_0_60px_rgba(59,130,246,0.15)] ring-2 ring-atlas-blue/30"
                      : "glass-2 border-white/10 hover:border-white/30 hover:shadow-3xl"
                  )}
                  role="group"
                  aria-labelledby={`task-title-${task.id}`}
                  aria-describedby={`task-status-${task.id}`}
                  whileHover={{ y: -2 }}
                >
                  {/* Header */}
                  <header className="flex justify-between items-start mb-6 pb-4 border-b border-white/10">
                    <div className="glass-2 inline-flex items-center gap-3 text-xs font-mono font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-900/30 px-5 py-2.5 rounded-2xl border border-white/20 backdrop-blur-xl">
                      <Clock className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      <span>Phase {index + 1}</span>
                      <span className="tracking-normal px-3 bg-slate-800/50 rounded-xl font-bold">•</span>
                      <span aria-label={`Category: ${task.category || 'Strategic'}`}>
                        {task.category || "Strategic"}
                      </span>
                    </div>

                    <motion.span
                      id={`task-status-${task.id}`}
                      className={cn(
                        "glass-2 px-5 py-2.5 rounded-2xl text-xs font-mono font-black uppercase tracking-widest border shadow-xl inline-flex items-center gap-2 backdrop-blur-3xl",
                        task.status === TaskStatus.COMPLETED
                          ? "border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-emerald/30"
                          : task.status === TaskStatus.IN_PROGRESS
                            ? "border-atlas-blue/50 bg-atlas-blue/20 text-atlas-blue shadow-[0_0_20px_rgba(59,130,246,0.2)] animate-pulse"
                            : "border-slate-800/50 bg-slate-900/50 text-slate-400 shadow-slate/20"
                      )}
                      role="status"
                      aria-live="polite"
                      animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                    >
                      {task.status.replace("-", " ").toUpperCase()}
                    </motion.span>
                  </header>

                  {/* Task description */}
                  <motion.h3
                    id={`task-title-${task.id}`}
                    className="font-display text-2xl font-bold text-white mb-6 leading-tight line-clamp-3 group-hover:text-white/95 drop-shadow-lg"
                    animate={isActive ? { scale: 1.02 } : { scale: 1 }}
                  >
                    {task.description}
                  </motion.h3>

                  {/* Dependencies */}
                  {task.dependencies && task.dependencies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="glass-2 mt-8 pt-6 border-t border-white/20 backdrop-blur-3xl rounded-2xl p-6"
                      role="list"
                      aria-label={`${task.dependencies.length} dependencies`}
                    >
                      <div className="font-mono text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                        Dependencies ({task.dependencies.length})
                      </div>
                      <ul className="flex flex-wrap gap-3" role="list">
                        {task.dependencies.slice(0, 8).map((depId) => (
                          <li key={depId}>
                            <motion.span
                              className="font-mono text-sm font-black text-atlas-blue bg-atlas-blue/10 hover:bg-atlas-blue/20 px-4 py-2.5 rounded-2xl border border-atlas-blue/30 hover:border-atlas-blue/50 transition-all backdrop-blur-xl inline-flex items-center gap-2 shadow-lg hover:shadow-xl group"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label={`Dependency task ${depId}`}
                            >
                              <span aria-hidden="true">#</span>
                              {depId}
                            </motion.span>
                          </li>
                        ))}
                        {task.dependencies.length > 8 && (
                          <li>
                            <span className="font-mono text-sm text-slate-500 px-5 py-2.5 bg-glass-2 rounded-2xl border border-white/20 backdrop-blur-xl shadow-lg">
                              +{task.dependencies.length - 8} more
                            </span>
                          </li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </motion.article>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </motion.div>
  );
};

export default TimelineView;
