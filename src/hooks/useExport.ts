import { useState, useCallback } from "react";
import { Plan } from "@types";
import { githubService, jiraService } from "../services";

/**
 * Hook to handle exporting tasks to GitHub and Jira.
 */
export function useExport(
  currentPlan: Plan | null,
  addMessage: (role: "user" | "assistant" | "system", content: string) => void
) {
  const [exportedTasks, setExportedTasks] = useState<
    Record<string, { github?: string; jira?: string }>
  >({});

  const handleExportTask = useCallback(
    async (taskId: string, type: "github" | "jira") => {
      const task = currentPlan?.tasks.find((t) => t.id === taskId);
      if (!task) return;

      try {
        setExportedTasks((prev) => ({
          ...prev,
          [taskId]: { ...prev[taskId], [type]: "pending" },
        }));

        let exportUrl = "";
        if (type === "github") {
          const result = await githubService.createIssue(task);
          exportUrl = result.htmlUrl;
        } else {
          const result = await jiraService.createTicket(task);
          exportUrl = result.webUrl || "";
        }

        setExportedTasks((prev) => ({
          ...prev,
          [taskId]: { ...prev[taskId], [type]: exportUrl },
        }));
        addMessage("assistant", `🚀 Successfully exported ${taskId} to ${type}`);
      } catch {
        setExportedTasks((prev) => {
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
    },
    [currentPlan, addMessage]
  );

  return { exportedTasks, handleExportTask };
}
