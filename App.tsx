/**
 * ATLAS App (v3.5.1) - Glassmorphic Strategic Intelligence Dashboard
 * Production React app with MissionControl → ReactFlow → GitHub/Jira sync
 *
 * FIX v3.5.1: `handleSend` catch block now surfaces the actual error message
 *   instead of swallowing it behind a generic string. This makes failures
 *   debuggable in production without requiring the browser console to be open.
 */

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Message, Plan, SubTask, TaskStatus } from "@types";
import { AtlasService } from "@services/geminiService";
import { PersistenceService } from "@services/persistenceService";
import { githubService, jiraService } from "@/services";
import TaskBank from "@components/views/TaskBank";
import SettingsModal from "@components/views/SettingsModal";
import { Sidebar, SidebarViewType } from "@components/views/Sidebar";
import { A2UIRenderer } from "@components/ui/A2UIRenderer";
import { A2UIMessage } from "@lib/adk/protocol";
import { MissionControl } from "@lib/adk/orchestrator";
import { cn } from "@lib/utils";
import {
  ChevronRight,
  Send,
  Activity,
  ShieldCheck,
  CloudLightning,
  FileJson,
  Zap,
} from "lucide-react";


const missionControl = new MissionControl();

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isWhatIfEnabled, setIsWhatIfEnabled] = useState(false);
  const [simulationResult, setSimulationResult] = useState<{
    cascade: string[];
    riskScore: number;
    impactedHighPriority: number;
  } | null>(null);
  const [sidebarView, setSidebarView] = useState<SidebarViewType>("list");
  const [isTaskBankOpen, setIsTaskBankOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [exportedTasks, setExportedTasks] = useState<Record<string, { github?: string; jira?: string }>>({});

  const chatEndRef = useRef<HTMLDivElement>(null);
  const taskRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const scrollToBottom = useCallback(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, scrollToBottom]);

  useEffect(() => {
    const savedMessages = PersistenceService.getMessages();
    const savedPlan = PersistenceService.getPlan();
    if (savedMessages.length > 0) setMessages(savedMessages);
    if (savedPlan) setCurrentPlan(savedPlan);
  }, []);

  useEffect(() => {
    PersistenceService.saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    PersistenceService.savePlan(currentPlan);
  }, [currentPlan]);

  const addMessage = useCallback((
    role: "user" | "assistant" | "system",
    content: string,
    a2ui?: A2UIMessage | string,
  ) => {
    const id = crypto.randomUUID();
    const message: Message = {
      id,
      role,
      content,
      timestamp: Date.now(),
      a2ui: typeof a2ui === "string" ? a2ui : a2ui ? JSON.stringify(a2ui) : undefined,
    };
    setMessages((prev) => [...prev, message]);
  }, []);

  /**
   * FIX v3.5.1: The catch block now surfaces the actual error message so that
   * failures are visible without opening DevTools. A generic fallback is still
   * shown for unknown error shapes.
   */
  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    addMessage("user", text);
    setInput("");
    setIsThinking(true);

    try {
      if (!currentPlan) {
        const result = await missionControl.processCollaborativeInput(text);
        setCurrentPlan(result.plan || null);
        addMessage("assistant", result.text, result.a2ui);
      } else {
        const taskToExecute = activeTaskId
          ? currentPlan.tasks.find(t => t.id === activeTaskId) || currentPlan.tasks[0]
          : currentPlan.tasks[0];

        const response = await AtlasService.executeSubtask(
          taskToExecute,
          currentPlan,
          messages.map((m) => `${m.role}: ${m.content}`).join("\n")
        );
        addMessage("assistant", response.text, response.a2ui);
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred. Please try again.";
      addMessage("assistant", `⚠️ Error: ${errorMessage}`);
      console.error("[Atlas] handleSend error:", err);
    } finally {
      setIsThinking(false);
    }
  };

  const handleTaskClick = (taskId: string) => {
    setActiveTaskId(taskId);
    const element = taskRefs.current[taskId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  const handleLinkDependency = useCallback((source: string, target: string) => {
    setCurrentPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === target
            ? { ...t, dependencies: [...new Set([...(t.dependencies || []), source])] }
            : t
        ),
      };
    });
    addMessage("assistant", `✓ Linked ${source} → ${target}`);
  }, [addMessage]);

  const handleFailureSimulation = async (taskId: string) => {
    if (!currentPlan) return;

    try {
      const result = await missionControl.simulateFailure(taskId, currentPlan);
      setSimulationResult(result);
      addMessage("assistant",
        `⚠️ Risk Analysis: ${taskId} failure impacts ${result.cascade.length} tasks (${result.riskScore.toFixed(1)}% risk)`
      );
    } catch {
      addMessage("assistant", "⚠️ Simulation failed");
    }
  };

  const handleDecompose = (taskId: string) => {
    const task = currentPlan?.tasks.find((t) => t.id === taskId);
    if (!task) return;
    handleSend(`Decompose task ${taskId}: ${task.description} into 3-5 subtasks.`);
  };

  const handleExportTask = async (taskId: string, type: "github" | "jira") => {
    const task = currentPlan?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      setExportedTasks((prev: Record<string, { github?: string; jira?: string }>) => ({
        ...prev,
        [taskId]: { ...prev[taskId], [type]: "pending" }
      }));

      let exportUrl = "";
      if (type === "github") {
        const result = await githubService.createIssue(task);
        exportUrl = result.htmlUrl;
      } else {
        const result = await jiraService.createTicket(task);
        exportUrl = result.webUrl || "";
      }

      setExportedTasks((prev: Record<string, { github?: string; jira?: string }>) => ({
        ...prev,
        [taskId]: { ...prev[taskId], [type]: exportUrl }
      }));
      addMessage("assistant", `🚀 Successfully exported ${taskId} to ${type}`);
    } catch {
      setExportedTasks((prev: Record<string, { github?: string; jira?: string }>) => {
        const next = { ...prev };
        if (next[taskId]) {
          const taskExports = { ...next[taskId] };
          delete taskExports[type];
          next[taskId] = taskExports;
        }
        return next;
      });
      addMessage("assistant", `❌ Export to ${type} failed`);
    }
  };

  const handleSyncAll = async () => {
    if (!currentPlan) return;
    setIsThinking(true);
    try {
      await AtlasService.summarizeMission(currentPlan, "Initiating global sync");
      addMessage("assistant", "🏛️ Roadmap synchronized across enterprise hubs.");
    } catch {
      addMessage("assistant", "⚠️ Sync failed.");
    } finally {
      setIsThinking(false);
    }
  };

  const isTaskBlocked = (task: SubTask, allTasks: SubTask[]) => {
    if (!task.dependencies || task.dependencies.length === 0) return false;
    return task.dependencies.some((depId) => {
      const dep = allTasks.find((t) => t.id === depId);
      return dep && dep.status !== TaskStatus.COMPLETED;
    });
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-50 overflow-hidden font-sans selection:bg-atlas-blue/30">
      <Sidebar
        currentPlan={currentPlan}
        activeTaskId={activeTaskId}
        sidebarView={sidebarView}
        setSidebarView={setSidebarView}
        setIsSettingsOpen={setIsSettingsOpen}
        isTaskBankOpen={isTaskBankOpen}
        setIsTaskBankOpen={setIsTaskBankOpen}
        onTaskClick={handleTaskClick}
        onDecompose={handleDecompose}
        onExportTask={handleExportTask}
        exportedTasks={exportedTasks}
        isTaskBlocked={isTaskBlocked}
        onLinkDependency={handleLinkDependency}
        isWhatIfEnabled={isWhatIfEnabled}
        setIsWhatIfEnabled={setIsWhatIfEnabled}
        simulationResult={simulationResult}
        setSimulationResult={setSimulationResult}
        onSimulateFailure={handleFailureSimulation}
        taskRefs={taskRefs}
      />

      {/* Main Chat Interface */}
      <section className="flex-1 flex flex-col relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-atlas-blue/5 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] left-[10%] w-[500px] h-[500px] bg-purple-500/5 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        </div>

        <div className="flex-1 overflow-y-auto px-12 py-12 space-y-12 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center max-w-2xl mx-auto text-center space-y-10">
              <div className="space-y-4">
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="inline-flex items-center gap-3 px-6 py-2 glass-2 rounded-full border border-white/10 text-[10px] font-mono font-black uppercase tracking-[0.2em] text-atlas-blue mb-4 shadow-xl"
                >
                  <span className="w-2 h-2 rounded-full bg-atlas-blue animate-ping" />
                  Gemini 2.0 Flash Core Active
                </motion.div>
                <h2 className="text-4xl md:text-6xl font-display font-black tracking-tighter text-white leading-[1.1]">
                  Architect your enterprise <span className="bg-clip-text text-transparent bg-gradient-to-r from-atlas-blue via-atlas-blue to-purple-400">future.</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
                  Atlas decomposes C-level goals into tactical roadmaps with autonomous agent oversight.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                {[
                  "Design a 2026 AI readiness roadmap for a global bank",
                  "Plan a SOC 2 transition for a remote-first unicorn",
                  "Draft a 6G infrastructure shift for APAC market",
                  "Create sustainable ESG reporting for manufacturing"
                ].map((prompt, i) => (
                  <motion.button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i, type: "spring" }}
                    className="group p-6 glass-2 rounded-3xl border border-white/5 hover:border-white/20 text-left transition-all hover:bg-white/5 active:scale-95 shadow-xl hover:shadow-2xl"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <CloudLightning className="h-4 w-4 text-slate-700 group-hover:text-atlas-blue transition-colors" />
                      <ChevronRight className="h-4 w-4 text-slate-800 group-hover:text-white transition-all transform group-hover:translate-x-1" />
                    </div>
                    <span className="text-sm font-medium text-slate-400 group-hover:text-slate-200 transition-colors">
                      {prompt}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto w-full space-y-12">
              <AnimatePresence mode="popLayout">
                {messages.map((m) => (
                  <motion.div
                    key={m.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-8 group",
                      m.role === "user" ? "flex-row-reverse" : "flex-row"
                    )}
                  >
                    <div className={cn(
                      "h-12 w-12 shrink-0 glass-2 rounded-2xl flex items-center justify-center border border-white/10 shadow-xl self-start",
                      m.role === "user" ? "bg-white/10" : "bg-atlas-blue/10"
                    )}>
                      {m.role === "user" ? (
                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 shadow-lg" />
                      ) : (
                        <ShieldCheck className="h-6 w-6 text-atlas-blue" />
                      )}
                    </div>

                    <div className={cn(
                      "flex-1 space-y-6",
                      m.role === "user" ? "text-right" : "text-left"
                    )}>
                      <div className={cn(
                        "inline-block px-10 py-7 rounded-[2.5rem] text-lg leading-relaxed shadow-2xl backdrop-blur-3xl",
                        m.role === "user"
                          ? "glass-2 border-white/10 text-white selection:bg-white/20"
                          : "glass-1 border-white/5 text-slate-200 selection:bg-atlas-blue/20"
                      )}>
                        {m.content}
                      </div>

                      {m.a2ui && (
                        <div className="mt-6">
                          <A2UIRenderer
                            elements={JSON.parse(m.a2ui).elements}
                            onEvent={(event) => {
                              console.log("A2UI Event:", event);
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isThinking && (
                <div className="flex gap-4 items-center pl-4 py-8">
                  <div className="flex gap-1.5 item-center group">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-2 h-2 rounded-full bg-atlas-blue/40"
                        animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-slate-600">
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    >
                      Synthesizing Strategic Response...
                    </motion.span>
                  </span>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>

        <div className="p-12 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent">
          <div className="max-w-4xl mx-auto relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-atlas-blue/20 to-purple-500/20 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 rounded-[3rem]" />
            <div className="relative glass-2 rounded-[2.5rem] border border-white/10 p-4 flex items-center gap-4 shadow-2xl focus-within:border-atlas-blue/50 focus-within:ring-2 focus-within:ring-atlas-blue/20 transition-all duration-300 backdrop-blur-3xl">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
                placeholder="Enter your strategic directive..."
                className="flex-1 bg-transparent border-none focus:ring-0 text-lg px-6 placeholder:text-slate-600 font-medium"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSyncAll}
                  className="p-4 glass-2 hover:bg-white/10 rounded-2xl border border-white/10 text-slate-400 hover:text-white transition-all shadow-lg active:scale-95"
                  title="Export to GitHub/Jira"
                >
                  <FileJson className="h-5 w-5" />
                </button>
                <button
                  onClick={() => handleSend(input)}
                  disabled={!input.trim() || isThinking}
                  className="h-14 w-14 bg-atlas-blue text-white rounded-2xl flex items-center justify-center transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:grayscale disabled:hover:scale-100"
                >
                  <Send className="h-6 w-6 font-bold" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center px-8 mt-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">
                  <Activity className="h-3 w-3" />
                  System Status: NOMINAL
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono font-black uppercase tracking-widest text-slate-600">
                  <Zap className="h-3 w-3" />
                  Latency: 42ms
                </div>
              </div>
              <div className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-700">
                © 2026 ATLAS CORP • ENTERPRISE CORE V3
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Task Bank Modal */}
      {isTaskBankOpen && (
        <TaskBank onClose={() => setIsTaskBankOpen(false)} onAddTask={(task) => {
          handleLinkDependency(task.id, activeTaskId || "");
          setIsTaskBankOpen(false);
        }} />
      )}

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      )}
    </div>
  );
};

export default App;
