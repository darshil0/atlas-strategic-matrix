/**
 * ATLAS Self-Healing Pipeline State Service (v3.6.4)
 * Autonomous graph analysis and self-healing engine for DAG conflict resolution, cycle breaking, and dependency repairs.
 */

import {
  Plan,
  SubTask,
  GraphIssue,
  HealingResolution,
  SelfHealingResult,
} from "@types";
import { RbacAuditService } from "./rbacAuditService";

export class SelfHealingService {
  /**
   * Analyze DAG health and detect pipeline graph issues
   */
  static diagnosePipeline(plan: Plan): { healthScore: number; issues: GraphIssue[] } {
    if (!plan.tasks || plan.tasks.length === 0) {
      return { healthScore: 100, issues: [] };
    }

    const issues: GraphIssue[] = [];
    const taskIds = new Set(plan.tasks.map((t) => t.id));

    // 1. Detect Invalid Task References
    plan.tasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        const invalidDeps = task.dependencies.filter((depId) => !taskIds.has(depId));
        if (invalidDeps.length > 0) {
          issues.push({
            id: `issue_invalid_${task.id}`,
            type: "INVALID_REFERENCE",
            severity: "HIGH",
            taskIds: [task.id, ...invalidDeps],
            description: `Task ${task.id} references non-existent dependency IDs: ${invalidDeps.join(", ")}`,
          });
        }
      }
    });

    // 2. Detect Circular Dependencies (Cycle Detection via Tarjan / DFS)
    const cycles = this.findCycles(plan.tasks);
    cycles.forEach((cycle, index) => {
      issues.push({
        id: `issue_cycle_${index}`,
        type: "CIRCULAR_DEPENDENCY",
        severity: "CRITICAL",
        taskIds: cycle,
        description: `Circular dependency detected in pipeline: ${cycle.join(" → ")}`,
      });
    });

    // 3. Detect Deadlocks / Isolated Orphaned Nodes without category or parent
    plan.tasks.forEach((task) => {
      const hasOutgoing = plan.tasks.some((t) => t.dependencies?.includes(task.id));
      const hasIncoming = task.dependencies && task.dependencies.length > 0;
      if (!hasIncoming && !hasOutgoing && !task.category && !task.quarter) {
        issues.push({
          id: `issue_orphan_${task.id}`,
          type: "ORPHANED_NODE",
          severity: "LOW",
          taskIds: [task.id],
          description: `Task ${task.id} is an isolated orphaned node without strategic category alignment.`,
        });
      }
    });

    // Calculate overall DAG health score (100 - weighted penalty per issue)
    let penalty = 0;
    issues.forEach((iss) => {
      if (iss.severity === "CRITICAL") penalty += 30;
      else if (iss.severity === "HIGH") penalty += 15;
      else if (iss.severity === "MEDIUM") penalty += 10;
      else penalty += 5;
    });

    const healthScore = Math.max(0, 100 - penalty);
    return { healthScore, issues };
  }

  /**
   * Automatically resolve dependency conflicts and heal pipeline graph state
   */
  static healPipeline(plan: Plan): { healedPlan: Plan; result: SelfHealingResult } {
    const initialDiagnosis = this.diagnosePipeline(plan);
    const initialHealthScore = initialDiagnosis.healthScore;

    // Clone plan tasks to apply repairs
    const healedTasks: SubTask[] = JSON.parse(JSON.stringify(plan.tasks));
    const resolvedIssues: HealingResolution[] = [];

    // Repair 1: Prune invalid dependency references
    healedTasks.forEach((task) => {
      if (task.dependencies && task.dependencies.length > 0) {
        const taskIds = new Set(healedTasks.map((t) => t.id));
        const validDeps = task.dependencies.filter((depId) => taskIds.has(depId));

        if (validDeps.length !== task.dependencies.length) {
          const removed = task.dependencies.filter((depId) => !taskIds.has(depId));
          task.dependencies = validDeps;

          resolvedIssues.push({
            issueId: `issue_invalid_${task.id}`,
            actionTaken: `Pruned non-existent dependency IDs [${removed.join(", ")}] from task ${task.id}`,
            status: "RESOLVED",
          });
        }
      }
    });

    // Repair 2: Break Circular Dependencies by removing cycle-closing edge
    let cycles = this.findCycles(healedTasks);
    let cyclePasses = 0;
    while (cycles.length > 0 && cyclePasses < 10) {
      cyclePasses++;
      cycles.forEach((cycle) => {
        // Break cycle between last and first node
        const sourceId = cycle[cycle.length - 2];
        const targetId = cycle[cycle.length - 1];

        const targetTask = healedTasks.find((t) => t.id === targetId);
        if (targetTask && targetTask.dependencies) {
          targetTask.dependencies = targetTask.dependencies.filter((d) => d !== sourceId);
          resolvedIssues.push({
            issueId: `cycle_break_${sourceId}_${targetId}`,
            actionTaken: `Broke circular dependency loop by removing dependency edge: ${targetId} → ${sourceId}`,
            removedDependencies: [[targetId, sourceId]],
            status: "RESOLVED",
          });
        }
      });
      cycles = this.findCycles(healedTasks);
    }

    // Repair 3: Align orphaned tasks
    healedTasks.forEach((task) => {
      if (!task.quarter) {
        task.quarter = "Q1";
        task.category = "2026 Q1";
      }
    });

    const finalDiagnosis = this.diagnosePipeline({ ...plan, tasks: healedTasks });

    const result: SelfHealingResult = {
      timestamp: Date.now(),
      initialHealthScore,
      healedHealthScore: finalDiagnosis.healthScore,
      resolvedIssues,
      remainingIssues: finalDiagnosis.issues,
    };

    const healedPlan: Plan = {
      ...plan,
      tasks: healedTasks,
      metadata: {
        ...(plan.metadata || {
          created: Date.now(),
          updated: Date.now(),
          version: "3.6.4",
          q1HighPriorityCount: 0,
          totalEffort: 0,
        }),
        updated: Date.now(),
      },
    };

    RbacAuditService.logAction(
      "PIPELINE_HEAL",
      `plan:${plan.id || "current"}`,
      `Executed autonomous self-healing: score improved from ${initialHealthScore}% to ${finalDiagnosis.healthScore}% (${resolvedIssues.length} issues resolved)`
    );

    return { healedPlan, result };
  }

  /**
   * Helper: Cycle detection using DFS
   */
  private static findCycles(tasks: SubTask[]): string[][] {
    const adjMap = new Map<string, string[]>();
    tasks.forEach((t) => {
      adjMap.set(t.id, t.dependencies || []);
    });

    const visited = new Set<string>();
    const recStack = new Set<string>();
    const cycles: string[][] = [];

    const dfs = (nodeId: string, path: string[]) => {
      visited.add(nodeId);
      recStack.add(nodeId);
      path.push(nodeId);

      const neighbors = adjMap.get(nodeId) || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          dfs(neighbor, [...path]);
        } else if (recStack.has(neighbor)) {
          const cycleStartIndex = path.indexOf(neighbor);
          if (cycleStartIndex !== -1) {
            const cyclePath = path.slice(cycleStartIndex);
            cyclePath.push(neighbor); // Close cycle loop display
            cycles.push(cyclePath);
          }
        }
      }

      recStack.delete(nodeId);
    };

    tasks.forEach((task) => {
      if (!visited.has(task.id)) {
        dfs(task.id, []);
      }
    });

    return cycles;
  }
}
