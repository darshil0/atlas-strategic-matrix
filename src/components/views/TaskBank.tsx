// src/components/TaskBank.tsx
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TASK_BANK } from "@data/taskBank";
import { Priority, BankTask } from "@types";
import { Search, X, Filter, Layers, Zap, Import } from "lucide-react";
import { cn } from "@lib/utils";

interface TaskBankProps {
  onAddTask: (task: BankTask) => void;
  onClose: () => void;
}

const THEME_COLORS: Record<string, string> = {
  AI: "text-atlas-blue bg-atlas-blue/10 border-atlas-blue/20",
  Global: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Infra: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  ESG: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  People: "text-pink-400 bg-pink-500/10 border-pink-500/20",
  Cyber: "text-rose-400 bg-rose-500/10 border-rose-500/20",
};

const PRIORITY_COLORS: Record<Priority, string> = {
  [Priority.HIGH]: "text-rose-400 border-rose-500/30 bg-rose-500/10",
  [Priority.MEDIUM]: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  [Priority.LOW]: "text-atlas-blue border-atlas-blue/30 bg-atlas-blue/10",
};

const TaskBank: React.FC<TaskBankProps> = ({ onAddTask, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);

  const query = search.trim().toLowerCase();
  const filteredTasks = TASK_BANK.filter((task: BankTask) => {
    const matchesSearch =
      !query ||
      task.description.toLowerCase().includes(query) ||
      task.id.toLowerCase().includes(query);
    const matchesTheme = selectedTheme ? task.theme === selectedTheme : true;
    return matchesSearch && matchesTheme;
  }).sort((a: BankTask, b: BankTask) => a.id.localeCompare(b.id));

  const themes = Object.keys(THEME_COLORS);

  return (
    <motion.div 
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="glass-1 border-l border-white/10 h-full w-full max-w-sm shadow-2xl"
    >
      {/* Header */}
      <div className="glass-2 p-6 border-b border-white/10 flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="font-display text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent flex items-center gap-2">
            <Layers className="h-7 w-7 text-atlas-blue" />
            Task Bank
          </h2>
          <p className="text-sm font-mono text-slate-400 uppercase tracking-widest">
            {filteredTasks.length} / {TASK_BANK.length} Objectives
          </p>
        </div>
        <motion.button
          onClick={onClose}
          className="p-2 glass-2 hover:bg-white/10 rounded-2xl border border-white/20 transition-all backdrop-blur-sm hover:scale-105"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <X className="h-5 w-5 text-slate-400" />
        </motion.button>
      </div>

      {/* Controls */}
      <div className="p-6 space-y-6 border-b border-white/5">
        {/* Search */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search strategic objectives..."
            className="w-full glass-2 pl-11 pr-4 py-3 text-sm text-white rounded-2xl border border-white/20 backdrop-blur-3xl focus:outline-none focus:border-atlas-blue/50 focus:ring-2 focus:ring-atlas-blue/30 transition-all placeholder:text-slate-500"
          />
        </motion.div>

        {/* Theme Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-xs font-mono font-black text-slate-500 uppercase tracking-widest">
            <Filter className="h-3 w-3" />
            Filter by Theme
          </div>
          <div className="flex flex-wrap gap-2">
            <motion.button
              onClick={() => setSelectedTheme(null)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-widest border transition-all backdrop-blur-sm",
                !selectedTheme
                  ? "glass-1 border-atlas-blue/30 bg-atlas-blue/20 text-atlas-blue shadow-lg shadow-atlas-blue/20"
                  : "glass-2 border-white/20 hover:border-white/40 text-slate-400 hover:text-slate-200",
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              All Themes
            </motion.button>
            {themes.map((theme) => (
              <motion.button
                key={theme}
                onClick={() => setSelectedTheme(theme)}
                className={cn(
                  "px-3 py-2 rounded-xl text-xs font-mono font-black uppercase tracking-widest border transition-all backdrop-blur-sm",
                  selectedTheme === theme
                    ? `glass-1 ${THEME_COLORS[theme]} shadow-lg`
                    : "glass-2 border-white/20 hover:border-white/40 text-slate-400 hover:text-slate-200",
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {theme}
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        <AnimatePresence>
          {filteredTasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-2 border border-white/10 p-12 rounded-3xl text-center"
            >
              <Search className="mx-auto h-12 w-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-display font-semibold text-slate-400 mb-2">
                No tasks found
              </h3>
              <p className="text-sm text-slate-500">
                Try adjusting your search or theme filter
              </p>
            </motion.div>
          ) : (
            filteredTasks.map((task, index) => (
              <motion.div
                layout
                key={task.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: index * 0.05 }}
                className="glass-2 group border border-white/10 hover:border-white/30 p-6 rounded-2xl hover:shadow-2xl transition-all backdrop-blur-3xl cursor-pointer relative overflow-hidden"
                onClick={() => onAddTask(task)}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Badges */}
                <div className="flex gap-2 mb-4">
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-mono font-black border backdrop-blur-sm",
                      THEME_COLORS[task.theme] || "text-slate-400 border-slate-500/30",
                    )}
                  >
                    {task.theme}
                  </span>
                  <span
                    className={cn(
                      "px-3 py-1.5 rounded-xl text-xs font-mono font-black border backdrop-blur-sm",
                      PRIORITY_COLORS[task.priority],
                    )}
                  >
                    {task.priority}
                  </span>
                </div>

                {/* Task Content */}
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-mono text-slate-500 bg-slate-900/50 px-2 py-1 rounded-lg">
                      #{task.id}
                    </span>
                  </div>
                  <h4 className="font-display text-lg font-bold text-white leading-tight mb-3 line-clamp-2 group-hover:text-white">
                    {task.description}
                  </h4>
                  <div className="flex items-center justify-between pt-4 border-t border-white/10">
                    <span className="text-xs font-mono uppercase text-slate-500 flex items-center gap-2 font-black tracking-widest">
                      <Zap className="h-4 w-4 text-slate-400" />
                      {task.category}
                    </span>
                    <motion.button
                      className="glass-1 px-4 py-2 border border-white/20 text-xs font-mono font-black uppercase tracking-widest rounded-xl bg-gradient-to-r from-atlas-blue/20 to-indigo-500/20 hover:from-atlas-blue/40 hover:to-indigo-500/40 text-atlas-blue hover:text-white shadow-lg hover:shadow-xl transition-all backdrop-blur-sm flex items-center gap-2"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Import className="h-3 w-3" />
                      Add to Plan
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default TaskBank;
