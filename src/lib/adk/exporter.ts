/**
 * Atlas PlanExporter (v3.6.1) - Glassmorphic Mermaid + Export Suite
 * Production-ready Mermaid.js diagrams for GitHub READMEs, Notion, Obsidian
 */

import { Plan, TaskStatus, Priority } from "@types";

/**
 * Escapes Mermaid special characters with production-grade safety
 */
function escapeMermaidLabel(text: string): string {
  return text
    .replace(/"/g, '\\"')
    .replace(/`/g, "&#96;")
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/[\r\n]+/g, " ")
    .replace(/ {2,}/g, " ")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface MermaidStyle {
  fill: string;
  stroke: string;
  strokeWidth: string;
  color: string;
  strokeDasharray?: string;
}

/**
 * Glassmorphic Mermaid Exporter - Copy-paste ready for GitHub/Notion
 */
export const PlanExporter = {
  /**
   * Generates production Mermaid flowchart matching your glassmorphic theme
   */
  toMermaid(plan: Plan): string {
    if (!plan.tasks?.length) {
      return `graph TD
  A["No tasks in plan"]
  classDef empty fill:#1e293b,stroke:#475569,color:#94a3b8`;
    }

    let mermaid = `\
graph TD
  %% Atlas v3.6.1 - Glassmorphic Strategic Roadmap
  %% Generated: ${new Date().toISOString().split('T')[0]}
`;

    // Glassmorphic matching your design system
    const glassStyles: Record<string, Partial<MermaidStyle>> = {
      [TaskStatus.PENDING.toLowerCase()]: {
        fill: "#0f172a80",
        stroke: "#334155cc",
        strokeWidth: "2px",
        color: "#94a3b8",
      },
      [TaskStatus.IN_PROGRESS.toLowerCase()]: {
        fill: "#1e40af40",
        stroke: "#3b82f6",
        strokeWidth: "3px",
        color: "#ffffff",
        strokeDasharray: "5,5",
      },
      [TaskStatus.COMPLETED.toLowerCase()]: {
        fill: "#04785740",
        stroke: "#10b981",
        strokeWidth: "2px",
        color: "#ffffff",
      },
      [TaskStatus.FAILED.toLowerCase()]: {
        fill: "#991b1b40",
        stroke: "#ef4444",
        strokeWidth: "3px",
        color: "#fee2e2",
      },
      [Priority.HIGH.toLowerCase()]: { stroke: "#ef4444", strokeWidth: "4px" },
      [Priority.MEDIUM.toLowerCase()]: { stroke: "#f59e0b", strokeWidth: "3px" },
      [Priority.LOW.toLowerCase()]: { stroke: "#3b82f6", strokeWidth: "2px" },
    };

    // Define glassmorphic classes
    Object.entries(glassStyles).forEach(([key, style]) => {
      mermaid += `  classDef ${key} `;
      Object.entries(style).forEach(([prop, value]) => {
        mermaid += `${prop}:${value},`;
      });
      mermaid = mermaid.slice(0, -1) + "\n";
    });

    // Generate nodes + edges
    plan.tasks.forEach((task) => {
      const shortId = task.id.slice(-4);
      const escapedDesc = escapeMermaidLabel(task.description);

      mermaid += `  ${task.id}["#${shortId}\\n${escapedDesc}"]`;
      mermaid += `:::${task.status.toLowerCase()}`;
      mermaid += `:::${task.priority.toLowerCase()}`;

      if (task.theme) {
        mermaid += `:::${task.theme.toLowerCase()}`;
      }

      mermaid += "\n";

      if (task.dependencies?.length) {
        task.dependencies.forEach(depId => {
          mermaid += `  ${depId} --> ${task.id}\n`;
        });
      }
    });

    return mermaid;
  },

  /**
   * GitHub-Flavored Markdown Table
   */
  toMarkdownTable(plan: Plan): string {
    if (!plan.tasks?.length) {
      return "| ID | Theme | Priority | Status | Category |\n|-----|-------|----------|---------|----------|\n| *(No tasks)* | | | | |";
    }

    const headers = "| ID | Theme | Priority | Status | Category |";
    const separator = "|----|-------|----------|--------|----------|";

    const rows = plan.tasks.map(task => {
      return `| ${task.id} | ${task.theme || "-"} | ${task.priority} | ${task.status} | ${task.category || "-"} |`;
    });

    return [headers, separator, ...rows].join("\n");
  },

  /**
   * JSON Export
   */
  toJSON(plan: Plan): string {
    return JSON.stringify(plan, null, 2);
  },
} as const;
