import { useState, useCallback } from "react";
import { Message, Plan, A2UIMessage } from "@types";
import { MissionControl } from "@lib/adk/orchestrator";
import { AtlasService } from "@services/ai/gemini";

const missionControl = new MissionControl();

export function useAtlasCore() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isThinking, setIsThinking] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<{
    cascade: string[];
    riskScore: number;
    impactedHighPriority: number;
  } | null>(null);

  const addMessage = useCallback(
    (
      role: "user" | "assistant" | "system",
      content: string,
      a2ui?: A2UIMessage | string
    ) => {
      const id = crypto.randomUUID();
      const message: Message = {
        id,
        role,
        content,
        timestamp: Date.now(),
        a2ui:
          typeof a2ui === "string"
            ? a2ui
            : a2ui
              ? JSON.stringify(a2ui)
              : undefined,
      };
      setMessages((prev) => [...prev, message]);
    },
    []
  );

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    addMessage("user", text);
    setIsThinking(true);

    try {
      if (!currentPlan) {
        const result = await missionControl.processCollaborativeInput(text);
        setCurrentPlan(result.plan || null);
        addMessage("assistant", result.text, result.a2ui);
      } else {
        const taskToExecute = activeTaskId
          ? currentPlan.tasks.find((t) => t.id === activeTaskId) ||
            currentPlan.tasks[0]
          : currentPlan.tasks[0];

        const response = await AtlasService.executeSubtask(
          taskToExecute,
          currentPlan,
          messages.map((m) => `${m.role}: ${m.content}`).join("\n")
        );
        if (response && typeof response.text === "string") {
          addMessage("assistant", response.text, response.a2ui);
        } else {
          throw new Error("Invalid response from AtlasService.executeSubtask");
        }
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

  const handleLinkDependency = useCallback(
    (source: string, target: string) => {
      setCurrentPlan((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          tasks: prev.tasks.map((t) =>
            t.id === target
              ? {
                  ...t,
                  dependencies: [
                    ...new Set([...(t.dependencies || []), source]),
                  ],
                }
              : t
          ),
        };
      });
      addMessage("assistant", `✓ Linked ${source} → ${target}`);
    },
    [addMessage]
  );

  const handleFailureSimulation = async (taskId: string) => {
    if (!currentPlan) return;
    try {
      const result = await missionControl.simulateFailure(taskId, currentPlan);
      setSimulationResult(result);
      addMessage(
        "assistant",
        `⚠️ Risk Analysis: ${taskId} failure impacts ${result.cascade.length} tasks (${result.riskScore.toFixed(1)}% risk)`
      );
    } catch {
      addMessage("assistant", "⚠️ Simulation failed");
    }
  };

  return {
    messages,
    setMessages,
    currentPlan,
    setCurrentPlan,
    isThinking,
    setIsThinking,
    activeTaskId,
    setActiveTaskId,
    simulationResult,
    setSimulationResult,
    addMessage,
    handleSend,
    handleLinkDependency,
    handleFailureSimulation,
  };
}
